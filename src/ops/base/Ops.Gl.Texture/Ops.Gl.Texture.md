# Texture

*Ops.Gl.Texture*

Load an image as a webGL Texture.

## Input

### File

*Type: Value*

Path and filename of the image

### filter

*Type: Value*

Pixel interpolation filter of the image. see: (https://open.gl/textures)

### Wrap

*Type: Value*

Wrapping of the image. see: (https://open.gl/textures)

### Flip

*Type: Value*

Flip image on the Y axis

### UnpackPreMultipliedAlpha

*Type: Value*

Change rendering of images with alpha channel

## Output

### trigger

*Type: Object*

The texture object. To be used in e.g. Mmaterial ops.

### width

*Type: Value*

Width of the imaage

### height

*Type: Value*

Height of the imaage

## Example

- [Some Example](https://cables.gl/p/570c17b5f34c419e0be30bd1)