
# Image Compositions

In this example we compose a new image / texture out of three individual images.

## Basic Setup

![](img/example_imgcomp_a.png)

- `Image compose` creates a new texture, children of `Image Compose` apply 2D effects onto the texture
- `DrawImage` applies an image
- This example does not change the image at all, it is just a basic setup

## Apply An Effect

- To blur the image we add `Blur` to the end of the image composition chain
- The image is now blurred, you can change the `Blur` parameters, or animate them

![](img/example_imgcomp_b.png)

## Add an Alpha Mask

![](img/example_imgcomp_c.png)

- `DrawImage` has a a slot called `imageAlpha`
- Using `alphaSrc` you can select what defines the alpha / opacity value, in this case the luminance of our alpha image:

![](img/example_imgcomp3.jpg)
