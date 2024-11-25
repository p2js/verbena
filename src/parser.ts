import { Token, TokenType } from './token';
import * as AST from './ast';

/*
The ideal function definition grammar could be defined like so:

fnDefinition -> IDENTIFIER "(" IDENTIFIER ("," IDENTIFIER)* ")" "=" expression clause?

      clause -> "{" logicalExpr ("," logicalExpr)* "}"
 logicalExpr -> expression ((">" | ">=" | "<" | "<" | "=") expression)+

  expression -> term
        term -> factor (("+" | "-") factor)*
      factor -> exponent ((("*"? | "/" | "%") exponent)*
    exponent -> (unary ^)* unary;
    negative -> ("-" negative) | factorial
   factorial -> (factorial "!") | primary
     primary -> IDENTIFIER | NUMBER | RESERVED_CONSTANT | group | fn
       group -> grouping | absGrouping
    grouping -> "(" expression ")"
 absGrouping -> "|" expression "|"
           fn -> RESERVED_FUNCTION ("_" primary)? "(" expression ("," expression)* ")"

However, this grammar is ambiguous when you combine 
absolute value groupings with implicit multiplication.

Consider the case |a|b|c|. This can either be parsed as |a|*b*|c|, or |(a*|b|*c)|.

Additionally, you'd need essentially infinite lookahead to be able to left-to-right parse an
expression like |a|b||, since it's impossible to know when getting to the second | whether
it opens a new grouping or closes the current one.

Verbena's grammar solves this ambiguity, and keeps the grammar LL(k) (and the parser efficient)
by disallowing immediately nested absolute value implicit multiplication.
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
        throw Error('[' + (peek()?.lexeme || 'end') + '] ' + message);
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

        let clauses: AST.LogicalExpr[] = [];

        if (match(TokenType.BRACE_L)) {
            do {
                clauses.push(logicalExpr());
            } while (match(TokenType.COMMA));
            expect(TokenType.BRACE_R, 'Expected \'}\' after function clause list');
        }

        let nextLexeme = peek()?.lexeme
        if (nextLexeme) throw new Error('Unexpected token ' + nextLexeme);

        return new AST.FnDecl(ident, params, body, clauses);
    }

    function logicalExpr() {
        let left = expression();

        if (!match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL, TokenType.EQUAL)) {
            throw Error('A function domain clause must have at least one condition');
        }

        do {
            let operator = previous();
            let right = expression();
            left = new AST.LogicalExpr(left, operator, right);
        } while (match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL, TokenType.EQUAL));

        return left;
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

        while (match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT, TokenType.NUMBER, TokenType.IDENTIFIER, TokenType.CONSTANT, TokenType.PAREN_L, TokenType.FUNCTION, matchForPipeToken)) {
            let token = previous();
            switch (token.type) {
                case TokenType.STAR:
                case TokenType.SLASH:
                case TokenType.PERCENT:
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
                    if (absStack[absStack.length - 1] && (previous().type == TokenType.PIPE)) throw new Error('Implicit multiplication with nested absolute value is not allowed, try inserting a * symbol');
                    left = new AST.Binary(left, new Token(TokenType.STAR, '*'), exponent());
                    break;
            }
        }

        return left;
    }

    function exponent() {
        let left = negative();
        if (match(TokenType.CARAT)) {
            absStack.push(false);
            let operator = previous();
            let right = exponent();
            absStack.pop();
            left = new AST.Binary(left, operator, right);
        }
        return left;
    }

    // function unary() {
    //     if (match(TokenType.MINUS)) {
    //         let operator = previous();
    //         let expr = unary();

    //         return new AST.Unary(operator, expr);
    //     }
    //     return primary();
    // }

    function negative() {
        if (match(TokenType.MINUS)) {
            let operator = previous();
            let expr = negative();

            return new AST.Unary(operator, expr);
        }
        return factorial();
    }

    function factorial() {
        let expr = primary();
        while (match(TokenType.BANG)) {
            let operator = previous();
            expr = new AST.Unary(operator, expr);
        }
        return expr;
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
            let variant: AST.Expr = null;
            if (match(TokenType.UNDERSCORE)) {
                variant = primary();
            }
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

            return new AST.FnCall(ident, variant, args);
        }

        //unexpected token
        let token = peek()?.lexeme;
        if (token) {
            throw Error('Unexpected token ' + token);
        } else {
            throw Error('Unexpected end of input');
        }

    }

    return declaration();
}