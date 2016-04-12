# DrawImage

*Ops.Gl.TextureEffects.DrawImage*

Draw an image to the current image compose.

## Input

### Render

*Type: Function*

Trigger the rendering

### amount

*Type: Value*

Amount/Percentage of blending the Image on to the current state of the compose

### Imaage

*Type: Object*

The image to be drawn

### BlendMode

*Type: Value*

How the image will be drawn/blended onto the state of image compose 

### ImageAlpha

*Type: Object*

Use this image as an alpha mask

### RemoveAlphaSrc

*Type: Value*

Completly ignore and remove the Alpha channel

### Invert alpha channel

*Type: Value*

invert the alpha channel

### Flip X

*Type: Value*

Flip image on the X axis

### Flip Y

*Type: Value*

Flip image on the Y axis

### Scale

*Type: Value*

Scale the image

## Output

### Trigger

*Type: Function*

Trigger the rendering of the next image effect.

## Example

- [Some Example](https://cables.gl/ui/#/project/570287b85cac100233a4f85f)