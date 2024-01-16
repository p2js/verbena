import * as AST from './ast';
import { TokenType } from './token';
import { standard, Library } from './lib';

function exprCompiler(node: AST.Expr, lib: Library = standard): string {
    switch (true) {
        case node instanceof AST.Literal:
            switch (node.value.type) {
                case TokenType.IDENTIFIER:
                case TokenType.NUMBER:
                    return node.value.lexeme;
                case TokenType.CONSTANT:
                    let lexeme = node.value.lexeme;
                    if (!Object.hasOwn(lib.constants, lexeme)) throw new Error('undefined constant ' + lexeme);
                    return '(' + lib.constants[lexeme] + ')';
            }
            break;
        case node instanceof AST.FnCall:
            let fnLexeme = node.ident.lexeme;
            if (!Object.hasOwn(lib.functions, fnLexeme)) throw Error('undefined function ' + fnLexeme);
            let fn = lib.functions[fnLexeme];
            if ((fn.length != 0) && (fn.length != node.args.length)) {
                throw Error('unexpected number of function arguments');
            }
            let argString = node.args.map((e) => exprCompiler(e)).join()
            return fn(argString);

        case node instanceof AST.Grouping:
            return '(' + exprCompiler(node.inner) + ')';
        case node instanceof AST.AbsGrouping:
            return 'Math.abs(' + exprCompiler(node.inner) + ')';
        case node instanceof AST.Unary:
            return '(' + node.operator.lexeme + exprCompiler(node.inner) + ')';
        case node instanceof AST.Binary:
            let operator = node.operator.type == TokenType.CARAT ? '**' : node.operator.lexeme;
            return '(' + exprCompiler(node.left) + operator + exprCompiler(node.right) + ')';
    }

    //should be unreachable, exclamation marks for debug purposes
    return '!!!';
}

export function compileFn(decl: AST.FnDecl, lib: Library = standard) {
    let paramList = decl.params.map(token => token.lexeme);

    let fnBody = 'return ' + exprCompiler(decl.body, lib) + ';';

    let output = new Function(...paramList, fnBody);

    return output;
};