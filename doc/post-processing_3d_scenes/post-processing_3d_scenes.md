
# Post-Processing 3D Scenes

You can find the finished patch here: [postprocessing](https://cables.gl/p/5645f59a9a013fa25927562a).

![](img/d_post_process.png)

## Basic Patch Layout

![](img/a_general_layout_full_patch.png)

## Step 1

- Render a scene to a texture

Resulting texture:

![](img/b_render_cubes_to_texture.png)

## Step 2

- Blur the resulting texture using `image compose` into a new one

Resulting texture:  

![](img/c_blur_effect.png)

## Step 3

- Compose a new image:
  - Draw the image from step 1
  - Draw the blurred image from step 2 using `blendmode`: `add`
  - Apply effects like `Noise` and `ChromaticAbbreviation`


Resulting texture:  

![](img/d_post_process.png)

## Step 4

- Draw the final `image compose` to the screen

