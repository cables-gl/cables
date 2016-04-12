# Cone

*Ops.Gl.Meshes.Cone*  

Draws a circle to the canvas.

## Input

### Render

*Type: Function*  
Executes the op, renders a circle to the canvas.

### Segments

*Type: Value*  
The number of segments, when small (e.g. `3`) it will turn into a triangle / polygon.

### Stacks

*Type: Value*  
How many vertices there are in the height dimension, add a [WireframeMaterial](../Ops.Gl.Shader.WireframeMaterial/Ops.Gl.Shader.WireframeMaterial.md)-op in front of it to see the difference.

### Radius

*Type: Value*  
Radius of the base circle.

### Steps

*Type: Value*  
Height of the cone.

## Output

### Trigger

*Type: Function*  
Every time `Cone` is triggered, it will also trigger all connected ops.

## Examples

- [Cone Example](https://cables.gl/ui/#/project/5702a134df94c65f116d27ed)

