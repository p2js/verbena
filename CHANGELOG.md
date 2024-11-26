# Changelog

## 0.4.1

- Internal changes only:
    - Library structure changed to not include separate source files for CJS and ESM imports.
        - This should not affect normal usage of the library.
        - Building now only takes place using `tsc`; ESBuild has been removed as a dev depedency.
    - Non-null assertions added to `nCr` and `nPr` library functions to comply with typescript.

## 0.4.0

- Added support for custom operation definition in libraries
    - Defined in `lib.operators`:
        - `add`, `sub`, `mul` and `div` describe the 4 binary arithmetic operators `x + y`, `x - y`, `x * y`, `x / y`
        - `pow` describes exponentiation `x^y`
        - `mod` describes the modulo operator `x % y`
        - `neg` describes the negative unary operator `-x`
        - `abs` describes absolute value `|x|`
        - `fac` describes the factorial `x!`
    - Acts as a method to "overload" JS' default operator behaviour
        - Either the whole object, or individual operators, can be left undefined to compile to basic JS numerical operators

- Added new operators: factorial (`x!`) and modulo (`x % y`)
    - Behaviour can be described by `lib.operators.fact` and `lib.operators.mod` respectively
    - Factorial will refer to `lib.functions.fact` otherwise

- Added new standard library functions
    - `fact` for computing factorials (alongside the new postfix `x!`)
    - `nCr` and `nPr` for combinations and permutations

- Made requirements for library definitions less strict
    - Custom libraries no longer need to define any functions or constants
        - The standard lexer and compiler have been modified to not error on this condition
        - However, the compiler will emit an error if the factorial operator `x!` is used without a defined `fact` function, as JS does not have a standard factorial function. This may be undesirable behaviour (though it would just error as it did when it was an undefined token prior to this version).

## 0.3.0

- Changed the `vbFunction` and `Library` interfaces, as well as the `fnOpts` type to use generics to allow different input and return types
- Added support for underscores in function calls for different variants, such as the standard library's `log_b(x)`
    - To declare a function with variants in a library, add an underscore to the end of its name, and add an additional paramater for the variant with a default value (eg. logarithm with base: `log_: (x, b = 10) => Math.log(x) / Math.log(b)`)
    - A call to the function without an underscore will use the default value

## 0.2.0

- Changed the library architecture to actual JS functions and numbers instead of source strings
- Added a `body` property to `vbFunction`s that holds the JS source string for the function body
    - Due to internal changes required by the library architecture change, the `toString` method now returns `[native code]`