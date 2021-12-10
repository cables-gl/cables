## Common pitfalls with the "usual suspects"

After following the steps in the section before, you should have a clearer idea on what is causing your bottleneck. Here are a few usual suspects that degrade performance:

Some ops (like [RandomCluster](https://cables.gl/op/Ops.Gl.RandomCluster) or [Repeat](https://cables.gl/op/Ops.Trigger.Repeat_v2)) trigger their following ops multiple times. When using high values, you are executing the same branch multiple times. If the following ops are resource-intense, you are multiplying the amount of CPU & GPU work it takes by how often the above ops trigger their following ops. Try using Flow mode to see the increased activity, and see if reducing repetitions helps your performance and still keeps the visual result.

Instead of using a RandomCluster, you could use a [MeshInstancer](https://cables.gl/op/Ops.Gl.MeshInstancer_v4) with a [RandomNumbersArray3](https://cables.gl/op/Ops.Array.RandomNumbersArray3_v2) to achieve a similar visual effect. This has the advantage that meshes get duplicated on the GPU instead of the CPU.

Another common pitfall are post processing effects. A commonly used effect includes the [Blur](Ops.Gl.TextureEffects.Blur). Blurring high resolution images will cause the patch to become slow. Try to reduce the size in the ImageCompose you are applying blur to. Instead of using the Blur op, you could also try using the [FastBlur](Ops.Gl.TextureEffects.FastBlur), which is considerably faster than the normal blur. 
