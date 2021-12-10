# Tools for debugging your patch

## The Performance op

Cables has a tool to measure performance. The [Performance op](https://cables.gl/op/Ops.Gl.Performance) should always be inserted right after the [MainLoop](https://cables.gl/op/Ops.Gl.MainLoop) as the second operator of your patch. In its minimized state, you can see the **FPS** (frames per second), the amount of time it takes for **CPU** calculations per frame in your patch & the amount of **GPU** calculations per frame (in **ms** - milliseconds).

When you expand the performance tab (by clicking on it), more information can be seen. The left-hand side is a time-based multi-color graph that keeps being updated every frame. 

There are 5 colors in total, each color representing a different measurement:

- Dark blue shows the time between two frames in ms (lower blue bar means more frames per second)
- Purple shows the time the MainLoop op needs to execute per frame
- Red shows the time that it takes for all calculations per frame in ms.
- Yellow is the amount of time it takes the GPU to compute a frame
- White bars indicate that single frames took longer than 33ms

On the right side, there is more detailed information about your patch:

- **frame avg**: the average time in ms it takes to compute the whole patch. The percentage shown is in relation to the time between two frames (blue graph). "self" indicates the time the [Performance op](https://cables.gl/op/Ops.Gl.Performance) itself took to gather all this information.
- **shader binds**: the number of shaders that are used to render one frame
- **uniforms**: the number of active shader uniforms (non MVP matrices)
- **mvp_uni_mat4**: the number of active model-, view- & projection matrices uniforms
- **num glPrimitives**: the number of primitives (triangles, points or lines) currently drawn on the screen
- **mesh.setGeom**: the number of new uploads of vertices to the GPU
- **videos**: the number of videos playing
- **tex preview**: the number of texture previews being shown (only relevant in editor)
- **draw meshes**: the number of meshes currently drawn on the screen
- **framebuffer blit**: the number of render to texture operations
- **texeffect blit**: the number of image compose operations
- **all shader compile time**: the time it took to compile all shaders (in ms)

Have a look at the [example patch](https://cables.gl/edit/5e9029d1c6835b4330a4c5ab) to see the different metrics in action.

With all of the above information, you are able to further diagnose what is causing a performance caveat in your patch.
In general, lower numbers relate to better rendering performance. Orange warnings shown by [Performance op](https://cables.gl/op/Ops.Gl.Performance) indicate that something is really slow in your patch, try to not have any warnings appear after loading of your patch is done.

## Flow mode

Flow mode allows you to ‘see’ the Flow of data between all operators in real time. Press **f** in the patch editor to activate or deactivate Flow mode. With Flow mode, you can see how often something is triggered and when. This is useful for debugging any bottlenecks.

Use Flow mode to make sure that all Ops that are currently being triggered are needed to draw the current scene onto the screen.
