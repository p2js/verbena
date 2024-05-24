import * as AST from './ast';
import { TokenType } from './token';
import { standard, Library } from './lib';
import { vbFunction } from './function';

class StandardExprHandler {
    public reservedConstants: string[];
    public reservedFunctions: {
        name: string,
        hasVariants: boolean,
        argCount: number
    }[];

    constructor(lib: Library<number> = standard, public paramList: string[]) {
        this.reservedConstants = Object.keys(lib.constants);
        this.reservedFunctions = Object.entries(lib.functions).map(([fName, fn]) => {
            let hasVariants = fName.endsWith('_');
            let name = hasVariants ? fName.slice(0, -1) : fName;
            let argCount = fn.length;

            return {
                name,
                hasVariants,
                argCount
            };
        });
    }

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
            case node instanceof AST.LogicalExpr:
                return this.handleLogicalExpr(node);
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
                if (!this.reservedConstants.includes(lexeme)) throw new Error('undefined constant ' + lexeme);
                return 'lib.constants.' + lexeme;
        }
    }

    handleFnCall(node: AST.FnCall): string {
        let fnLexeme = node.ident.lexeme;
        let fn = this.reservedFunctions.find(fn => fn.name == fnLexeme);
        if (!fn) throw Error('undefined function ' + fnLexeme);

        if ((fn.argCount != 0) && (fn.argCount != node.args.length)) {
            throw Error(`unexpected number of function arguments: expected ${fn.argCount}, found ${node.args.length}`);
        }

        if (fn.hasVariants) {
            fnLexeme += '_';
        } else if (node.variant != null) {
            throw Error(`function '${fnLexeme}' does not have variants`);
        }

        let argString = node.args.map((e) => { return this.compileExpr(e) }).join();
        if (node.variant != null) argString += "," + this.compileExpr(node.variant);

        return 'lib.functions.' + fnLexeme + '(' + argString + ')';
    }

    handleGrouping(node: AST.Grouping): string {
        return '(' + this.compileExpr(node.inner) + ')';
    }

    handleAbsGrouping(node: AST.AbsGrouping): string {
        let absFn = this.reservedFunctions.find(f => f.name == 'abs') ? 'lib.functions.abs(' : 'Math.abs(';
        return absFn + this.compileExpr(node.inner) + ')';
    }

    handleUnary(node: AST.Unary): string {
        return node.operator.lexeme + this.compileExpr(node.inner);
    }

    handleBinary(node: AST.Binary): string {
        let operator = node.operator.type == TokenType.CARAT ? '**' : node.operator.lexeme;
        return this.compileExpr(node.left) + operator + this.compileExpr(node.right);
    }

    handleLogicalExpr(node: AST.LogicalExpr): string {
        let left = this.compileExpr(node.left);

        let operator = node.operator.type == TokenType.EQUAL ? '==' : node.operator.lexeme;

        let right = operator + this.compileExpr(node.right);

        if (node.left instanceof AST.LogicalExpr) {
            right = '&&' + this.compileExpr(node.left.right) + right;
        }

        return left + right;
    }
}

export function compileFn(decl: AST.FnDecl, lib: Library<number> = standard): vbFunction<number> {
    let paramList = decl.params.map(token => token.lexeme);

    let handler = new StandardExprHandler(lib, paramList);

    let fnBody = 'return ' + handler.compileExpr(decl.body) + ';';

    if (decl.clauses.length != 0) {
        let condition = decl.clauses.map(clause => handler.compileExpr(clause)).join('&&');
        fnBody = 'if(' + condition + '){' + fnBody + '}else{return undefined;}'
    }

    let fn = new Function('lib', ...paramList, fnBody).bind(null, lib) as vbFunction<number>;
    Object.defineProperties(fn, {
        name: {
            value: decl.ident.lexeme,
            writable: false,
            enumerable: false
        },
        ast: {
            value: decl,
            writable: false,
            enumerable: false
        },
        paramList: {
            value: paramList,
            writable: false,
            enumerable: false
        },
        body: {
            value: fnBody,
            writable: false,
            enumerable: false
        }
    });

    return fn;
};