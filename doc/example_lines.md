
## drawing lines

- op ```Ops.Gl.Meshes.Spline``` will draw lines. points of the line are defined via ```Ops.Gl.Meshes.SplinePoint``` ops.
- translate the edges using the ```transform``` op

![](/doc/example_lines.png)

- try creating lines with transformation ops, like ```randomcluster```, ```randomcluster``` , ```TransformToGeometryVertices``` 
- the output triggerpoints can be used to draw a mesh at every edge of the line

[basic example](/ui/#/project/5645eee89a013fa259275628)
[more advanced example](/ui/#/project/5620a32b489447af7d5e48e0)

