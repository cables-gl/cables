# Modulo

*Ops.Math.Modulo*  

The result of a division, e.g. if you divide `5` by `2`, the rest is `1`, this is modulo.

## Input

### Dividend

*Type: Value*  
`a` in `a % b`

### Divisor

*Type: Value*  
`b` in `a % b`

### Ping Pong

*Type: Value [true, false]*  
This is a handy little helper. If you e.g. use `Modulo` with the time ([RelativeTime](../ops/Ops.Anim.RelativeTime/Ops.Anim.RelativeTime.md)) this can be used to prevent *jumps*, the output will then alternate between smaller and bigger values instead of going up, then to zero and back up again.

## Output

### Result

*Type: Value*  
Result of modulo

## Examples

- [Modulo Ping Pong Example](https://cables.gl/ui/#/project/570d12d702252bd51bc586e8)