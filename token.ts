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
    FUNCTION,
    CONSTANT,
    IDENTIFIER
}

export class Token {
    constructor(public type: TokenType, public lexeme: string) { }
}