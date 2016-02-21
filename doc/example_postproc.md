
# postprocessing 3d scenes

be sure to read both examples first:
- [rendering to textures](/doc/example_r2t)
- [composing images](/doc/example_imgcomp)

![](/imgdoc/example_postproc.jpg)
![](/imgdoc/example_postproc2.png)

## step 1

- render a scene to a texture

resulting texture: (grey lines are transparent)

![](/imgdoc/example_postproc3.jpg)

## step 2

- blur the resulting texture using imagecompose into a new one.

resulting texture:

![](/imgdoc/example_postproc4.jpg)

## step 3

- compose a new image:
    - set a background color
    - draw the image from step 1
    - draw the blured image from step 2 using blendmode "add"
    - apply effects like noise and chromatic abbreviation


resulting texture:

![](/imgdoc/example_postproc.jpg)

## step 4

- draw the compose image to the screen


----

[example project](/ui/#/project/5645f59a9a013fa25927562a)
