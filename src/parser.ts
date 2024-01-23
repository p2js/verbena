import { Token, TokenType } from './token';
import * as AST from './ast';

/*
    Ideal math grammar defined like so:

    fnDeclaration -> IDENTIFIER "(" IDENTIFIER ("," IDENTIFIER)* ")" "=" expression

     expression -> term
           term -> factor (("+" | "-") factor)*
         factor -> exponent ((("*"? | "/") exponent)*
       exponent -> (unary ^)* unary;
          unary -> ("-" unary) | primary;

        primary -> IDENTIFIER | NUMBER | RESERVED_CONSTANT | group | fn

          group -> grouping | absGrouping
       grouping -> "(" expression ")"
    absGrouping -> "|" expression "|"

             fn -> RESERVED_FUNCTION "(" expression (',' expression)* ")"


    Verbena's grammar only differs in that it doesn't allow immediately nested absolute value implicit multiplication.
    Expressions like this are disallowed, and * signs must be inserted:
    |2|3||
    ||2|3|

*/

export function parse(tokenStream: Token[]) {
    let currentToken = 0;

    // HELPERS

    /*
    Helper stack for absolute value. 
    New values are pushed when depth increases,
    and set to true when the parser is in an AbsGropuing 
    at the current depth. 
    */
    let absStack = [false];

    //get current token without advancing
    let peek = () => tokenStream[currentToken];
    //get previous token
    let previous = () => tokenStream[currentToken - 1];
    //consume and return token
    let advance = () => {
        if (currentToken < tokenStream.length) currentToken++;
        return previous();
    };
    //check whether current token matches given type
    let check = (type: TokenType) => currentToken >= tokenStream.length ? false : (peek().type == type);
    //conditional advance if current token matches any of the given types
    let match = (...types: TokenType[]) => {
        for (let type of types) {
            if (check(type)) {
                advance();
                return true;
            }
        }
        return false;
    };
    //conditional advance, else error
    let expect = (type: TokenType, message: string) => {
        if (check(type)) return advance();
        throw Error('[' + peek().lexeme + '] ' + message);
    }

    // GRAMMAR IMPLEMENTATION

    function declaration() {
        let ident = expect(TokenType.IDENTIFIER, 'Expected function identifier');

        expect(TokenType.PAREN_L, 'Expected \'(\' after function identifier');

        let params: Token[] = [];
        if (!check(TokenType.PAREN_R)) {
            do {
                params.push(expect(TokenType.IDENTIFIER, 'Expected function parameter name or closing parenthesis'));
            } while (match(TokenType.COMMA));
        };

        expect(TokenType.PAREN_R, 'Expected \')\' after function parameter list');
        expect(TokenType.EQUAL, 'Expected \'=\' after function signature');

        let body = expression();

        return new AST.FnDecl(ident, params, body);
    }

    function expression() {
        return term();
    }

    function term() {
        let left = factor();

        while (match(TokenType.PLUS, TokenType.MINUS)) {
            let operator = previous();
            let right = factor();
            left = new AST.Binary(left, operator, right);
        }

        return left;
    }

    function factor() {
        let left = exponent();

        //match for explicit multiplication/division tokens and implicit multiplication by primary types
        //only match for PIPE if we are not in an abs at the current depth: match for star again otherwise (redundant)
        let matchForPipeToken = (absStack[absStack.length - 1] ? TokenType.STAR : TokenType.PIPE);

        while (match(TokenType.STAR, TokenType.SLASH, TokenType.NUMBER, TokenType.IDENTIFIER, TokenType.CONSTANT, TokenType.PAREN_L, TokenType.FUNCTION, matchForPipeToken)) {
            let token = previous();
            switch (token.type) {
                case TokenType.STAR:
                case TokenType.SLASH:
                    absStack.push(false);
                    left = new AST.Binary(left, token, exponent());
                    absStack.pop();
                    break;
                case TokenType.PIPE:
                case TokenType.NUMBER:
                case TokenType.IDENTIFIER:
                case TokenType.CONSTANT:
                case TokenType.PAREN_L:
                case TokenType.FUNCTION:
                    currentToken--;
                    if (absStack[absStack.length - 1] && (previous().type == TokenType.PIPE)) throw new Error("Implicit multiplication with nested absolute value is not allowed, try inserting a * symbol");
                    left = new AST.Binary(left, new Token(TokenType.STAR, '*'), exponent());
                    break;
            }
        }

        return left;
    }

    function exponent() {
        let left = unary();
        if (match(TokenType.CARAT)) {
            absStack.push(false);
            let operator = previous();
            let right = exponent();
            absStack.pop();
            left = new AST.Binary(left, operator, right);
        }
        return left;
    }

    function unary() {
        if (match(TokenType.MINUS)) {
            let operator = previous();
            let expr = unary();

            return new AST.Unary(operator, expr);
        }
        return primary();
    }

    function primary(): AST.Expr {
        if (match(TokenType.NUMBER, TokenType.IDENTIFIER, TokenType.CONSTANT)) {
            return new AST.Literal(previous());
        }
        if (match(TokenType.PAREN_L)) {
            absStack.push(false);
            let inner = expression();
            absStack.pop();
            expect(TokenType.PAREN_R, 'unclosed grouping');
            return new AST.Grouping(inner);
        }
        if (match(TokenType.PIPE)) {
            //only open a new abs grouping if we're not in an abs grouping
            if (!absStack[absStack.length - 1]) {
                absStack[absStack.length - 1] = true;
                let inner = expression();
                expect(TokenType.PIPE, 'unclosed grouping');
                absStack[absStack.length - 1] = false;
                return new AST.AbsGrouping(inner);
            }
            //otherwise, if the PIPE is preceded by another PIPE or +/-, it's a valid nesting
            switch (tokenStream[currentToken - 2].type) {
                case TokenType.PIPE:
                case TokenType.PLUS:
                case TokenType.MINUS:
                    absStack.push(true);
                    let inner = expression();
                    expect(TokenType.PIPE, 'unclosed grouping');
                    absStack.pop();
                    return new AST.AbsGrouping(inner);
            }
            throw new Error(`[${currentToken}] Unexpected abs bar`);
        }
        if (match(TokenType.FUNCTION)) {
            let ident = previous();
            let args: AST.Expr[] = [];
            expect(TokenType.PAREN_L, 'expected \'(\' after function');
            if (!check(TokenType.PAREN_R)) {
                do {
                    absStack.push(false);
                    args.push(expression());
                    absStack.pop();
                } while (match(TokenType.COMMA));
            }
            expect(TokenType.PAREN_R, 'expected \')\' after function arguments');

            return new AST.FnCall(ident, args);
        }
        //unexpected token
        throw Error("Unexpected token " + peek().lexeme);
    }

    return declaration();
}