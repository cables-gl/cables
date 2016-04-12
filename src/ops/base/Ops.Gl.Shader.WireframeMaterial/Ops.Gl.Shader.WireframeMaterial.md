# WireframeMaterial

*Ops.Gl.Shader.WireframeMaterial*  

Renders wireframes

![Sphere Wireframe Image](img/sphere_wireframe.png)

## Input

### Render

*Type: Function*  

### Fill

*Type: Value [true, false]*   
If set, background will be drawn (currently the color cannot be chosen).

### Width

*Type: Value*  
Line thickness

### Opacity

*Type: Value [0..1]*  
Opacity, used for stroke and fill. `0` = invisible, `1` = fully visible

### Red

*Type: Value [0..1]*  
Red value of the stroke color

### Green

*Type: Value [0..1]*  
Green value of the stroke color

### Blue

*Type: Value [0..1]*  
Blue value of the stroke color

## Output

### Trigger

*Type: Function*  
Every time `WireframeMaterial` is triggered, it will also trigger all connected ops.

## Example

- [Cone Example](https://cables.gl/ui/#/project/5702a134df94c65f116d27ed)
- [Sphere Rotation Example](https://cables.gl/ui/#/project/5702a838df94c65f116d27ef)
