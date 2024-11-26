type BinaryOperator<T> = (left: T, right: T) => T;
type UnaryOperator<T> = (x: T) => T;

export interface Library<T> {
    operations?: Partial<
        Record<'add' | 'sub' | 'mul' | 'div' | 'pow' | 'mod', BinaryOperator<T>>
        &
        Record<'abs' | 'neg' | 'fac', UnaryOperator<T>>
    >,
    functions?: { [key: string]: (...args: T[]) => T },
    constants?: { [key: string]: T }
}

export const standard: Library<number> = {
    functions: {
        abs: Math.abs,
        acos: Math.acos,
        acosh: Math.acosh,
        asin: Math.asin,
        asinh: Math.asinh,
        atan: Math.atan,
        atanh: Math.atanh,
        cbrt: Math.cbrt,
        ceil: Math.ceil,
        cos: Math.cos,
        cosh: Math.cosh,
        exp: Math.exp,
        fact: function factorial(x) {
            return x < 2 ? x : x * factorial(x - 1);
        },
        floor: Math.floor,
        hypot: Math.hypot,
        log_: (x, b = 10) => Math.log(x) / Math.log(b),
        ln: Math.log,
        max: Math.max,
        min: Math.min,
        nCr: (n, r) => standard.functions!.fact(n) / (standard.functions!.fact(r) * standard.functions!.fact(n - r)),
        nPr: (n, r) => standard.functions!.fact(n) / standard.functions!.fact(n - r),
        pow: Math.pow,
        random: Math.random,
        round: Math.round,
        sign: Math.sign,
        sin: Math.sin,
        sinh: Math.sinh,
        sqrt: Math.sqrt,
        tan: Math.tan,
        tanh: Math.tanh
    },
    constants: {
        pi: Math.PI,
        e: Math.E
    },
}