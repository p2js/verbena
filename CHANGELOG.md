# Changelog

## 0.3.0

- Changed the `vbFunction` and `Library` interfaces, as well as the `fnOpts` type to use generics to allow different input and return types
- Added support for underscores in function calls for different variants, such as the standard library's `log_b(x)`
    - To declare a function with variants in a library, add an underscore to the end of its name, and add an additional paramater for the variant with a default value (eg. logarithm with base: `log_: (x, b = 10) => Math.log(x) / Math.log(b)`)
    - A call to the function without an underscore will use the default value

## 0.2.0

- Changed the library architecture to actual JS functions and numbers instead of source strings
- Added a `body` property to `vbFunction`s that holds the JS source string for the function body
    - Due to internal changes required by the library architecture change, the `toString` method now returns `[native code]`