# ClearColor

*Ops.Gl.ClearColor*  

Sets the background color of the canvas.

## Input

### Render

*Type: Function*  
Executes the op

### R

*Type: Value*  
Red color value, between `0.0` and `1.0`

### G

*Type: Value*  
Green color value, between `0.0` and `1.0`

### B

*Type: Value*  
Blue color value, between `0.0` and `1.0`

### A

*Type: Value*  
Alpha value (opacity), between `0.0` (not visible) and `1.0` (fully visible). 

## Output

### Trigger

*Type: Function*  
Every time `ClearColor` is triggered, it will also trigger all connected ops.

## Examples

- [ClearColor Example](https://cables.gl/ui/#/project/57028bef0a78b40d10bb9233)