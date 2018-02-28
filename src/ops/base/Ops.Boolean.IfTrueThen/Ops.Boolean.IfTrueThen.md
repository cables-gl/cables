Can be used as a switch. If the input `Boolean` is `true`/ `1` the output port `Then` will be triggered. If `Boolean` is `false` / `0` the output port `Else` will be triggered.  

You can also input non-boolean values, `0`, `0.0`, `''` (empty string) will all evaluate to `false`. On the contrary `1.234`, '5' or 'lalala' will evaluate to `true`.

You can use it in two ways: If `Exe` is connected `Then` / `Else` will be triggered every time `Exe` is triggered. If `Exe` is not connection `Then` / `Else` will be triggered every time `Boolean` changes. This way you can convert a bool to a trigger (function).
