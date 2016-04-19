# IfTrueThen

*Ops.Boolean.IfTrueThen*  

Can be used as a switch. If the input `Boolean` is `true`/ `1` the output port `Then` will be triggered. If `Boolean` is `false` / `0` the output port `Else` will be triggered.  
Will trigger `True` or `False` every time `Execute` is triggered.

## Input

### Exe

*Type: Function*

Will trigger `True` or `False` every time `Execute` is triggered.  

### Boolean

*Type: Value*  

The bool value to check

## Output

### Then

*Type: Function*  

Triggers when `Execute` is triggered and `Boolean` is `true` / `1`

### Else

*Type: Function*  

Triggers when `Execute` is triggered and `Boolean` is `false` / `0`
