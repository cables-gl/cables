# Sphere

*Ops.Gl.Meshes.Sphere*  

Draws a Sphere to the canvas.

## Input

### Render [Function]

Renders a sphere to the canvas.

### Stacks [Value]

How many vertices there are in the height dimension, add a [WireframeMaterial](../Ops.Gl.Shader.WireframeMaterial/Ops.Gl.Shader.WireframeMaterial.md)-op in front of it to see the difference.

### Slices [Value]

How many segments there are in the horizontal dimension.

### Radius [Value]

Radius of the sphere

## Output

### Trigger [Function]

Every time `Sphere` is triggered, it will also trigger all connected ops.

## Example

[Sphere Rotation Example](https://cables.gl/ui/#/project/5702a838df94c65f116d27ef)

