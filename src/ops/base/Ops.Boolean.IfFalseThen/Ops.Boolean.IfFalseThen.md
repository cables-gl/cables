Basically the same as Ops.Boolean.IfTrueThen, the only difference is that the output ports are switched. 

You can also input non-boolean values, `0`, `0.0`, `''` (empty string) will all evaluate to `false`. On the contrary `1.234`, '5' or 'lalala' will evaluate to `true`.

You can use it in two ways: If `Exe` is connected `Then` / `Else` will be triggered every time `Exe` is triggered. If `Exe` is not connection `Then` / `Else` will be triggered every time `Boolean` changes. This way you can convert a bool to a trigger (function).