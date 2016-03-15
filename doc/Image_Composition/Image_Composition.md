
# composing images

in this example we compose a new image/texture out of three individual images


## basic setup

![](/imgdoc/example_imgcomp_a.png)

- image compose creates a new texture. childs of image compose apply 2d effects onto the texture.
- ```drawimage``` applies an image
- this example does not change the image at all. it is just a basic setup

## apply an effect

- to blur the image we add ```blur``` to the end of the image compose chain.
- the image is now blured. you can change the blur parameters, or animate them

![](/imgdoc/example_imgcomp_b.png)

## draw the first image again with a alpha mask

![](/imgdoc/example_imgcomp_c.png)


- ```drawimage``` has a a slot called ```imageAlpha```
- using ```alphaSrc```, you can select what defines the alpha/opacity value, in this case the luminance of our alpha image:

![](/imgdoc/example_imgcomp3.jpg)

----


[render to texture example](/ui/#/project/5645f59a9a013fa25927562a)
