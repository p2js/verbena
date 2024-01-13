import { Token, TokenType } from './token';
import * as AST from './ast';

/*
    Grammar defined like so:

    declaration -> IDENTIFIER "(" IDENTIFIER ("," IDENTIFIER)* ")" "=" expression

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
*/

export function parse(tokenStream: Token[]) {
    let currentToken = 0;

    // HELPERS

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
        throw Error('(' + peek().lexeme + ') ' + message);
    }

    // GRAMMAR IMPLEMENTATION

    function declaration() {
        let ident = expect(TokenType.IDENTIFIER, 'Expected function identifier');

        expect(TokenType.PAREN_L, 'Expected \'(\' after function identifier');

        let params: Token[] = [];
        if (!check(TokenType.PAREN_R)) {
            params.push(expect(TokenType.IDENTIFIER, 'Expected function parameter name or closing parenthesis'));
            while (match(TokenType.COMMA)) {
                params.push(expect(TokenType.IDENTIFIER, 'Expected function parameter name after comma'));
            }
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
        while (match(TokenType.STAR, TokenType.SLASH, TokenType.NUMBER, TokenType.IDENTIFIER, TokenType.CONSTANT, TokenType.PAREN_L, /*TokenType.PIPE,*/ TokenType.FUNCTION)) {
            let token = previous();
            switch (token.type) {
                case TokenType.STAR:
                case TokenType.SLASH:
                    left = new AST.Binary(left, token, exponent());
                    break;
                case TokenType.NUMBER:
                case TokenType.IDENTIFIER:
                case TokenType.CONSTANT:
                case TokenType.PAREN_L:
                //case TokenType.PIPE:
                case TokenType.FUNCTION:
                    currentToken--;
                    left = new AST.Binary(left, new Token(TokenType.STAR, '*'), exponent());
                    break;
            }
        }

        return left;
    }

    function exponent() {
        let left = unary();
        if (match(TokenType.CARAT)) {
            let operator = previous();
            let right = exponent();
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
            let inner = expression();
            expect(TokenType.PAREN_R, 'unclosed grouping');
            return new AST.Grouping(inner);
        }
        if (match(TokenType.PIPE)) {
            let inner = expression();
            expect(TokenType.PIPE, 'unclosed grouping');
            return new AST.AbsGrouping(inner);
        }
        if (match(TokenType.FUNCTION)) {
            let ident = previous();
            let args: AST.Expr[] = [];
            expect(TokenType.PAREN_L, 'expected \'(\' after function');
            if (!check(TokenType.PAREN_R)) {
                args.push(expression());
                while (match(TokenType.COMMA)) args.push(expression());
            }
            expect(TokenType.PAREN_R, 'expected \')\' after function arguments');

            return new AST.FnCall(ident, args);
        }
        //unexpected token
        throw Error("Unexpected token " + peek().lexeme);
    }

    return declaration();
}