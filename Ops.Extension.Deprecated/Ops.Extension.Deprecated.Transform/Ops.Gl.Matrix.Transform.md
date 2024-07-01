# Transform

*Ops.Gl.Matrix.Transform*  

Can be used to move or rotate objects. All elements which are drawn afterwards will be affected by this. If you use multiple transforms in a row the transformations will be stacked on top of each other (added).

## Input

### Render

*Type: Function*  
Red color value, between `0.0` and `1.0`

### Position X

*Type: Value*  
X-position change

### Position Y

*Type: Value*  
Y-position change

### Position Z

*Type: Value*  
Z-position change

### Scale

*Type: Value*  
Changes the scale of the objects drawn afterwards – when smaller than `1` the object will be drawn smaller, when bigger than `1` the object will be drawn bigger.

### Rotation X

*Type: Value*  
X-rotation change

### Rotation Y

*Type: Value*  
Y-rotation change

### Rotation Z

*Type: Value*  
Z-rotation change

## Output

### Trigger

*Type: Function*  
Every time `Transform` is triggered, it will also trigger all connected ops.

## Examples

- [Sphere Rotation Example](https://cables.gl/ui/#/project/5702a838df94c65f116d27ef)
- [Basic Cube Light](https://cables.gl/ui/#/project/5702a7fd99572b98331e3659)