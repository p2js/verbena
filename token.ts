export enum TokenType {
    //parens, braces
    PAREN_L,
    PAREN_R,
    BRACE_L,
    BRACE_R,
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