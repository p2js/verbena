import * as AST from './ast';
import { Token } from './token';
//defaults
import { Library, standard as std } from './lib';
import { scan as standardScanner } from './lexer';
import { parse as standardParser } from './parser';
import { compileFn as standardCompiler } from './compileFn';

export interface vbFunction<T> {
    (...x: T[]): T;
    ast: AST.FnDecl;
    paramList: string[];
    body: string;
}

type FnOpts<T> = {
    lib: Library,
    scanner: (source: string, lib?: Library) => Token[],
    parser: (tokenStream: Token[]) => AST.FnDecl,
    compiler: (decl: AST.FnDecl, lib?: Library) => vbFunction<T>
}

export function Function(source: string, opts: Partial<FnOpts<number>> = {}): vbFunction<number> {
    opts.lib ||= std;
    let scan = opts.scanner || standardScanner;
    let parse = opts.parser || standardParser;
    let compile = opts.compiler || standardCompiler;

    let tokens = scan(source, opts.lib);
    let decl = parse(tokens);

    return compile(decl, opts.lib);
}