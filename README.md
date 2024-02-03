# Verbena

Verbena is a math/algebra library built in TypeScript. It aims to provide an end-user-safe way to process mathematical expressions/functions and transcompile them to native JS.

## Features

- Transpilation of mathematical function definitions to native JS functions
- A modular and expandable architecture with support for exposing custom libraries

## Usage

You can install verbena using [npm](https://www.npmjs.org/package/verbena):

```sh
npm install mathjs
```

Otherwise, you can build the library yourself by cloning into this repository, installing the required build dependencies with `npm i` and then running the build script with `npm run build`.

Use the provided `Function` constructor to convert a source string to a native function:

```js
import * as vb from "verbena"; //esm
const vb = require("verbena"); //commonJS

const fn = vb.Function("f(x,y) = 2x^2 + ln(|y|)"); // [function: f]
fn(2, -1); // 8
```

## Extensibility

Verbena is designed to be easily extended with custom features that interact wi.

### Custom libraries

Function compilation will use the built-in `standard` library by default. This library exposes a variety of functions and constants found in the standard javascript Math object (eg `Math.sin()` and `Math.PI` as `sin()` and `pi` respectively).

If you want to provide some custom functions and constants, or override some of the standard ones, you can make your own library object with those properties (note that libraries must return valid javascript as a string in order to work properly).

**WARNING:** Make sure not to expose any sensitive or unsafe behavior in custom libraries.

Typescript developers can also take advantage of the provided `Library` interface to ensure the library complies with the standard.

```ts
// Custom library example (in typescript)
// exposes all the standard functions, plus custom "double" and "square" functions
// as well as just a single constant for the square root of 2

import * as vb from 'verbena';
import { Library, standard as std } from 'verbena/lib';

let customLib: Library = {
    functions: {
        ...std.functions,
        double: (x) => `(2*${x})`,
        square: (x) => `Math.pow(${x}, 2)`
    },
    constants: {
        root: 'Math.SQRT2'
    }
}

let customLibFn = vb.Function("f(x)=double(root*x)", { lib: customLib });
```

### Custom components

Sometimes, the standard provided function components (such as the standard tokenizer or parser) may not provide the functionality needed for a project. For example, a rich HTML text input capable of producing a verbena AST directly would benefit from overcoming some of the limitations of plain text.

If you want to write your own components to plug into the verbena ecosystem, you can easily import individual components required to build functions:

```ts
// Custom parse function example (in typescript)
import { Token } from "verbena/token";
import * as AST from "verbena/AST";

// Parsers should take in an array of tokens and return a function declaration
function differentParser(tokenStream: Token[]): AST.FnDecl { /* your code here */ };

// You can feed it into the standard Function constructor as an option...
import { Function } from "verbena";
let f = Function("f(x) = x", { parser: differentParser });

// or do everything yourself using the other standard components
import { scan } from "verbena/lexer";
import { compileFn } from "verbena/compileFn";

let g = compileFn(differentParser(scan("g(x) = 2x")));
```

## Limitations

Verbena aims to handle math notation as completely as feasibly possible in plain text. However, this does come with some compromises and limitations.

### Ambiguities in mathematical notation

The standard parser supports both implicit multiplication of tokens and groupings (`2.2xy(x)` desugars to `2.2*x*y*(x)`) as well as representing absolute value groupings with the `|` character (`|x|` desugars to `abs(x)`). 

Combining these two facts leads to an ambiguity. Consider the case `|a|b|c|`. This can either be parsed as `|a|*b*|c|`, or `|(a*|b|*c)|`.

Additionally, in a case like `|a|b||`, the parser would need infinite lookahead to determine whether the second `|` is closing the current grouping or opening another one. 

Verbena's parser solves this ambiguity and maintains efficiency by disallowing immediately nested absolute value implicit multiplication. This means `|a|b|c|` will parse as `|a|*b*|c|`. Additionally, expressions like `|2|3||` and `||2|3|` are disallowed, and `*` signs must be inserted. 

Because this is a relatively niche problem and almost uselsess to support (wrapping the inner expressions in absolute values has absolutely no effect on the outcome), it was determined that the parser's overall efficiency was a more important priority.