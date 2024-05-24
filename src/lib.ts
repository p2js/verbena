export interface Library {
    functions: { [key: string]: (...args: number[]) => number },
    constants: { [key: string]: number }
}

export const standard: Library = {
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
        floor: Math.floor,
        hypot: Math.hypot,
        log_: (x, b = 10) => Math.log(x) / Math.log(b),
        ln: Math.log,
        max: Math.max,
        min: Math.min,
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
    }
}