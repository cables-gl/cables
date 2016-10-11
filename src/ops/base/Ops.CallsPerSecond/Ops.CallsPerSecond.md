# CallsPerSecond

*Ops.CallsPerSecond*  

Counts how often `Execute` has been triggered per second, if you connect the `Execute`-port of [MainLoop](../Ops.Gl.MainLoop/Ops.Gl.MainLoop.md) e.g. it outputs the current framerate.

## Input

### Execute

*Type: Function*  
The function-port you want to count, e.g. `Execute` of [MainLoop](../Ops.Gl.MainLoop/Ops.Gl.MainLoop.md)

## Output

### Cps

*Type: Value*  
Calls per second – how often `Execute` has been triggered
