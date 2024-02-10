# Changelog

## 0.2.0

- Changed the library architecture to actual JS functions and numbers instead of source strings
- Added a `body` property to `vbFunction`s that holds the JS source string for the function body
    - Due to internal changes required by the library architecture change, the `toString` method now returns `[native code]`