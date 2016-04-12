# Triangle

*Ops.Gl.Meshes.Triangle*  

Draws a triangle to the canvas.

![Triangle Image](img/triangle.png)

## Input

### Render

*Type: Function*  
Renders a circle to the canvas.

### Width

*Type: Value*  
Width of the triangle

### Height

*Type: Value*  
Width of the triangle

## Output

### Trigger

*Type: Function*  
Every time `Circle` is triggered, it will also trigger all connected ops.

### Geometry

*Type: Object*  
For advanced use cases you can output the geometry data (vertices, normals) to use in another op, see [Transform To Geometry Vertices Example](https://cables.gl/ui/#/project/570cd04d3b97df5829deae10) (uses a [Sphere](../Ops.Gl.Meshes.Sphere/Ops.Gl.Meshes.Sphere.md) instead).  

**TODO**

## Example

- [Simple Triangle Example](https://cables.gl/ui/#/project/57038db0caa091505d4d6d92)