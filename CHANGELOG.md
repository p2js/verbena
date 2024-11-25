# Changelog

## 0.4.0 (WIP)

- Added new operators: factorial (`x!`) 

TODO

- Added support for custom operation definition in libraries
    - Defined in `lib.operators`:
        - `add`, `sub`, `mul` and `div` describe the 4 binary arithmetic operators `x + y`, `x - y`, `x * y`, `x / y`
        - `pow` describes exponentiation `x^y`
        - `mod` describes the modulo operator `x % y`
        - `neg` describes the negative unary operator `-x`
        - `abs` describes absolute value `|x|`
        - `fac` describes the factorial `x!`
    - Acts as a method to "overload" JS' default operator behaviour
        - Can be left undefined to compile to basic JS numerical operators
        - Like Verbena's `standard`, porting a custom library to 0.4.0 simply involves appending `operations: {}`

- ! and modulo (`n % m`)
    - Behaviour can be described by `lib.operators.fact` and `lib.operators.mod` respectively
    - Factorial will fall back to `lib.functions.fact` as a default

- Added new standard library functions
    - `fact` and `mod` for factorial and modulo
    - `nCr` and `nPr` for combinations and permutations



## 0.3.0

- Changed the `vbFunction` and `Library` interfaces, as well as the `fnOpts` type to use generics to allow different input and return types
- Added support for underscores in function calls for different variants, such as the standard library's `log_b(x)`
    - To declare a function with variants in a library, add an underscore to the end of its name, and add an additional paramater for the variant with a default value (eg. logarithm with base: `log_: (x, b = 10) => Math.log(x) / Math.log(b)`)
    - A call to the function without an underscore will use the default value

## 0.2.0

- Changed the library architecture to actual JS functions and numbers instead of source strings
- Added a `body` property to `vbFunction`s that holds the JS source string for the function body
    - Due to internal changes required by the library architecture change, the `toString` method now returns `[native code]`