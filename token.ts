export enum TokenType {
    //parens, braces
    PAREN_L,
    PAREN_R,
    BRACE_L,
    BRACE_R,
    //abs pipe
    PIPE,
    //operators
    PLUS,
    MINUS,
    STAR,
    SLASH,
    CARAT,
    //equality or comparison
    EQUAL,
    GREATER,
    GREATER_EQUAL,
    LESS,
    LESS_EQUAL,
    //comma (fn args)
    COMMA,
    //literal
    NUMBER,
    IDENTIFIER
}

export class Token {
    type: TokenType;
    lexeme: string;

    constructor(type: TokenType, lexeme: string) {
        this.type = type;
        this.lexeme = lexeme;
    }
}