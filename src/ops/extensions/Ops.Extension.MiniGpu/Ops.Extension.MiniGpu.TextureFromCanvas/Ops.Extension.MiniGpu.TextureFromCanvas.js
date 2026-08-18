const
    exec = op.inTrigger("Trigger"),
    inCanv = op.inObject("element", null, "element"),
    next = op.outTrigger("next"),
    outTexture = op.outObject("texture", null, "texture");

let texture = null;

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;

    if (!inCanv.get()) return;

    const canvas = inCanv.get();

    if (!texture || texture.width != canvas.width || texture.height != canvas.height)
    {
        if (texture) texture.destroy();

        texture = mgpu.device.createTexture(
            {
                "size": [canvas.width, canvas.height, 1],
                "format": "rgba8unorm",
                "usage": GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT
            });

        outTexture.setRef(texture);
        // console.log("create tex", canvas.width, canvas.height);
    }

    mgpu.device.queue.copyExternalImageToTexture({ "source": canvas }, { "texture": texture }, [canvas.width, canvas.height]);
    next.trigger();
};
