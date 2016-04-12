# Or

*Ops.Or*  

Performs a logical OR operation on two values. If one of the input ports is `true` (not `0`), the `Result` will be `true` as well, `false` otherwise.

| Bool1 | Bool2 | Result |
|-------|-------|--------|
| 0     | 0     | 0      |
| 0     | 1     | 1      |
| 1     | 0     | 1      |
| 1     | 1     | 1      |

## Input

### Bool1-8

*Type: Value [true, false]*  
Boolean input ports, if either of them is `true` the `Result` will be `true` as well.

## Output

### Result

*Type: Value [true, false]*  
Result of the or operation


