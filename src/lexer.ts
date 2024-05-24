import { Token, TokenType } from './token';

import { standard, Library } from './lib';

function isDigit(c: string) {
    return c >= '0' && c <= '9';
}

function isLetter(c: string) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

export function scan(source: string, lib: Library = standard): Token[] {
    let reservedConstants = Object.keys(lib.constants);
    //strip underscores from reserved function names
    let reservedFunctions = Object.keys(lib.functions).map(functionName => functionName.endsWith('_') ? functionName.slice(0, -1) : functionName);

    let tokens: Token[] = [];

    let current = 0;  //current character
    let start = 0; //start of current lexeme

    //consume and return next char
    const advance = () => source[current++];
    //conditional advance
    const match = (char: string) => {
        if ((current > source.length) || (source[current] != char)) return false;
        current++;
        return true;
    }
    //lookahead helper (n chars ahead)
    const peek = (n = 0) => {
        if (current + n > source.length) return '\0';
        return source[current + n];
    }
    //push token to array
    const addToken = (type: TokenType, lexeme: string = source.substring(start, current)) => {
        tokens.push(new Token(type, lexeme));
    }

    while (current < source.length) {
        //beginning of lexeme
        start = current;

        let char = advance();
        switch (char) {
            //parens, braces
            case '(': addToken(TokenType.PAREN_L); break;
            case ')': addToken(TokenType.PAREN_R); break;
            case '{': addToken(TokenType.BRACE_L); break;
            case '}': addToken(TokenType.BRACE_R); break;
            //abs pipe
            case '|': addToken(TokenType.PIPE); break;
            //operators
            case '+': addToken(TokenType.PLUS); break;
            case '-': addToken(TokenType.MINUS); break;
            case '*': addToken(TokenType.STAR); break;
            case '/': addToken(TokenType.SLASH); break;
            case '^': addToken(TokenType.CARAT); break;
            //equality, comparison
            case '=': addToken(TokenType.EQUAL); break;
            case '>': addToken(match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
            case '<': addToken(match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            //comma (fn args)
            case ',': addToken(TokenType.COMMA); break;
            //underscore (fn variants)
            case '_': addToken(TokenType.UNDERSCORE); break;
            //chars to ignore
            case ' ':
            case '\r':
            case '\t':
            case '\n':
                break;
            default:
                //number literal
                if (isDigit(char)) {
                    while (isDigit(peek())) advance();
                    //radix point handler
                    if (peek() == '.') {
                        advance();
                        if (!isDigit(peek())) {
                            throw Error('Expected fractional part after radix point');
                        }
                        while (isDigit(peek())) advance();
                    }
                    let chunk = source.substring(start, current);
                    addToken(TokenType.NUMBER, chunk);
                    break;
                }
                //identifier(s)
                if (isLetter(char)) {
                    while (isLetter(peek())) {
                        advance();
                    }
                    let chunk = source.substring(start, current);
                    if (reservedFunctions.includes(chunk)) {
                        addToken(TokenType.FUNCTION, chunk);
                    } else if (reservedConstants.includes(chunk)) {
                        addToken(TokenType.CONSTANT, chunk)
                    } else {
                        chunk.split('').forEach((ident) => {
                            tokens.push(new Token(TokenType.IDENTIFIER, ident))
                        });
                    }
                    break;
                }
                throw Error('Unexpected character ' + char);
        }
    };

    return tokens;
}