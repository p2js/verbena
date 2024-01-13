export interface Library {
    functions: { [key: string]: (...args: any[]) => string },
    constants: { [key: string]: string }
}

export const standard: Library = {
    functions: {
        abs: (x) => 'Math.abs(' + x + ')',
        acos: (x) => 'Math.acos(' + x + ')',
        acosh: (x) => 'Math.acosh(' + x + ')',
        asin: (x) => 'Math.asin(' + x + ')',
        asinh: (x) => 'Math.asinh(' + x + ')',
        atan: (x) => 'Math.atan(' + x + ')',
        atanh: (x) => 'Math.atanh(' + x + ')',
        cbrt: (x) => 'Math.cbrt(' + x + ')',
        ceil: (x) => 'Math.ceil(' + x + ')',
        cos: (x) => 'Math.cos(' + x + ')',
        cosh: (x) => 'Math.cosh(' + x + ')',
        exp: (x) => 'Math.exp(' + x + ')',
        floor: (x) => 'Math.floor(' + x + ')',
        hypot: (...x) => 'Math.hypot(' + x.join() + ')',
        //log: (b, x) => 'Math.log(' + x + ') / Math.log(' + b + ')',
        ln: (x) => 'Math.log(' + x + ')',
        max: (x) => 'Math.max(' + x + ')',
        min: (x) => 'Math.min(' + x + ')',
        pow: (x) => 'Math.pow(' + x + ')',
        random: () => 'Math.random()',
        round: (x) => 'Math.round(' + x + ')',
        sign: (x) => 'Math.sign(' + x + ')',
        sin: (x) => 'Math.sin(' + x + ')',
        sinh: (x) => 'Math.sinh(' + x + ')',
        sqrt: (x) => 'Math.sqrt(' + x + ')',
        tan: (x) => 'Math.tan(' + x + ')',
        tanh: (x) => 'Math.tanh(' + x + ')'
    },
    constants: {
        pi: 'Math.PI',
        e: 'Math.E'
    }
}