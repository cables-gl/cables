# Cube

*Ops.Gl.Meshes.Cube*  

![cube](img/cube.png)


Draws a cube to the canvas. Please note that without doing a rotation using a [Transform](../Ops.Gl.Matrix.Transform/Ops.Gl.Matrix.Transform.md)-op you will only see a rectangle.

## Input

### Render

*Type: Function*  
Executes the op, renders a cube to the canvas.

### Center

*Type: Value [true, false]*  
If set to true, rotations will be done around the cube-center, if false rotations will be done around a corner.

### Width

*Type: Value*  
Width of the cube

### Height

*Type: Value*  
Height of the cube

### Length

*Type: Value*  
Length of the cube

## Output

### Trigger

*Type: Function*  
Every time `Cube` is triggered, it will also trigger all connected ops.

### Geometry

*Type: Texture*  
For advanced use cases you can also output the geometry data to use in another op, see [Transform To Geometry Vertices Example](https://cables.gl/ui/#/project/570cd04d3b97df5829deae10) (uses a [Sphere](../Ops.Gl.Meshes.Sphere/Ops.Gl.Meshes.Sphere.md) instead).

## Examples

- [Basic Cube Light](https://cables.gl/ui/#/project/5702a7fd99572b98331e3659)
