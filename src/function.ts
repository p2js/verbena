import * as AST from './ast';
import { Token } from './token';
//defaults
import { Library, standard as std } from './lib';
import { scan as standardScanner } from './lexer';
import { parse as standardParser } from './parser';
import { compileFn as standardCompiler } from './compileFn';

export interface vbFunction {
    (...x: number[]): number;
    ast: AST.FnDecl;
    paramList: string[];
    body: string;
}

type FnOpts = {
    lib: Library,
    scanner: (source: string, lib?: Library) => Token[],
    parser: (tokenStream: Token[]) => AST.FnDecl,
    compiler: (decl: AST.FnDecl, lib?: Library) => vbFunction
}

export function Function(source: string, opts: Partial<FnOpts> = {}): vbFunction {
    opts.lib ||= std;
    let scan = opts.scanner || standardScanner;
    let parse = opts.parser || standardParser;
    let compile = opts.compiler || standardCompiler;

    let tokens = scan(source, opts.lib);
    let decl = parse(tokens);

    return compile(decl, opts.lib);
}