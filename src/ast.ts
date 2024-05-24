import { Token } from './token';

export class FnDecl {
    constructor(public ident: Token, public params: Token[], public body: Expr, public clauses?: LogicalExpr[]) { }
}

export class LogicalExpr {
    constructor(public left: Expr, public operator: Token, public right: Expr) { }
}

export abstract class Expr { }

export class AbsGrouping extends Expr {
    constructor(public inner: Expr) { super(); }
}

export class Grouping extends Expr {
    constructor(public inner: Expr) { super(); }
}

export class Literal extends Expr {
    constructor(public value: Token) { super(); }
}

export class FnCall extends Expr {
    constructor(public ident: Token, public variant: Expr, public args: Expr[]) { super(); }
}

export class Unary extends Expr {
    constructor(public operator: Token, public inner: Expr) { super(); }
}

export class Binary extends Expr {
    constructor(public left: Expr, public operator: Token, public right: Expr) { super(); }
}


