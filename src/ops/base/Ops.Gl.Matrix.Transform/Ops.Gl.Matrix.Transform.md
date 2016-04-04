# Transform

*Ops.Gl.Matrix.Transform*  

Can be used to move or rotate objects. All elements which are drawn afterwards will be affected by this.

## Input

### Render

Red color value, between `0.0` and `1.0`

### G [Value]

Green color value, between `0.0` and `1.0`

### B [Value]

Blue color value, between `0.0` and `1.0`

### A [Value]

Alpha value (opacity), between `0.0` (not visible) and `1.0` (fully visible). 

## Output

### Trigger [Function]

Every time `ClearColor` is triggered, it will also trigger all connected ops.

## Example

[ClearColor Example](https://cables.gl/ui/#/project/57028bef0a78b40d10bb9233)
