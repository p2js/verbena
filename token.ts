export enum TokenType {
    //parens, braces
    PAREN_LEFT,
    PAREN_RIGHT,
    BRACE_LEFT,
    BRACE_RIGHT,
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
    //literal
    NUMBER,
    IDENTIFIER,
    //end
    END
}

export class Token {
    type: TokenType;
    lexeme: string;
    literal: any;

    constructor(type: TokenType, lexeme: string, literal?: any) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal || null;
    }
}