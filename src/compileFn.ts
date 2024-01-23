import * as AST from './ast';
import { TokenType } from './token';
import { standard, Library } from './lib';

class StandardExprHandler {
    constructor(public lib: Library = standard, public paramList: string[]) { }

    compileExpr(node: AST.Expr) {
        switch (true) {
            case node instanceof AST.Literal:
                return this.handleLiteral(node);
            case node instanceof AST.FnCall:
                return this.handleFnCall(node);
            case node instanceof AST.Grouping:
                return this.handleGrouping(node);
            case node instanceof AST.AbsGrouping:
                return this.handleAbsGrouping(node);
            case node instanceof AST.Unary:
                return this.handleUnary(node);
            case node instanceof AST.Binary:
                return this.handleBinary(node);
        }
        //should be unreachable, exclamation marks for debug purposes
        return '!!!';
    }

    handleLiteral(node: AST.Literal): string {
        let lexeme = node.value.lexeme;
        switch (node.value.type) {
            case TokenType.IDENTIFIER:
                if (!this.paramList.includes(lexeme)) throw Error('undefined identifier ' + lexeme);
            case TokenType.NUMBER:
                return lexeme;
            case TokenType.CONSTANT:
                if (!Object.hasOwn(this.lib.constants, lexeme)) throw new Error('undefined constant ' + lexeme);
                return this.lib.constants[lexeme];
        }
    }

    handleFnCall(node: AST.FnCall): string {
        let fnLexeme = node.ident.lexeme;
        if (!Object.hasOwn(this.lib.functions, fnLexeme)) throw Error('undefined function ' + fnLexeme);
        let fn = this.lib.functions[fnLexeme];
        if ((fn.length != 0) && (fn.length != node.args.length)) {
            throw Error('unexpected number of function arguments');
        }
        let argString = node.args.map((e) => { return this.compileExpr(e) }).join();
        return fn(argString);
    }

    handleGrouping(node: AST.Grouping): string {
        return '(' + this.compileExpr(node.inner) + ')';
    }

    handleAbsGrouping(node: AST.AbsGrouping): string {
        return 'Math.abs(' + this.compileExpr(node.inner) + ')';
    }

    handleUnary(node: AST.Unary): string {
        return node.operator.lexeme + this.compileExpr(node.inner);
    }

    handleBinary(node: AST.Binary): string {
        let operator = node.operator.type == TokenType.CARAT ? '**' : node.operator.lexeme;
        return this.compileExpr(node.left) + operator + this.compileExpr(node.right);
    }
}


export function compileFn(decl: AST.FnDecl, lib: Library = standard) {
    let paramList = decl.params.map(token => token.lexeme);

    let fnBody = 'return ' + new StandardExprHandler(lib, paramList).compileExpr(decl.body) + ';';

    let output = new Function(...paramList, fnBody);

    return output;
};