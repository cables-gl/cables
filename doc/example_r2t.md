
# rendering to textures

in this example we render a 3d scene to a texture.
the texture is used in a material, which is applied to a cube.


![](/imgdoc/example_r2t.png)
![](/imgdoc/example_r2t_ops.png)



## Ops.Gl.Render2Texture

```Ops.Gl.Render2Texture``` render everything, that comes after, into a texture and outputs the texture to the first output port.



click on the ```midiInput``` and then use a knob on your midi device. the output parameter ```note``` will show the note id of the knob. use this id in your ```midiValue``` Op to get the value of this specific knob.

[render to texture example](/ui/#/project/5645f1619a013fa259275629)
