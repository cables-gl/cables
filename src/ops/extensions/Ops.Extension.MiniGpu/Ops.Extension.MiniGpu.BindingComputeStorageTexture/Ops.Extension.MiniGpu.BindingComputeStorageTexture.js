const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inWidth = op.inInt("Width", 256),
    inHeight = op.inInt("Height", 256),
    next = op.outTrigger("Next"),
    outTexture = op.outObject("texture");

let texture = null;
let binding = null;

inHeight.onChange =
    inWidth.onChange = () =>
    {
        texture = null;
    };

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!texture)
    {
        texture = mgpu.device.createTexture(
            {
                "size": [inWidth.get(), inHeight.get()],
                "format": "rgba8unorm",
                "usage": GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC
            });
        const layout = {
            "visibility": GPUShaderStage.COMPUTE,
            "storageTexture":
            {
                "access": "write-only",
                "format": "rgba8unorm",
                "viewDimension": "2d"
            }
        };

        binding = {
            "header": "var " + inName.get() + ": texture_storage_2d<rgba8unorm, write>;",
            "resource": texture.createView(),
            "layout": layout
        };
        outTexture.setRef(texture);

        mgpu.rebuildShaderModule = "new uniform binding: " + inName.get();
    }

    mgpu.bindings.push(binding);

    next.trigger();
};
