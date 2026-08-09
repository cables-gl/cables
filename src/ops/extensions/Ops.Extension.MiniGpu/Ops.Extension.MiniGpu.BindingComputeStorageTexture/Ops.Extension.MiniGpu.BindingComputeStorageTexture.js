const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inInit = op.inSwitch("Init", ["0", "1", "R"], "0"),
    next = op.outTrigger("Next"),
    outTexture = op.outObject("texture");

let texture = null;
let binding = null;

// inName.onChange = () =>
// {
//     buffer = null;
// };

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!texture)
    {
        texture = mgpu.device.createTexture(
            {
                "size": [256, 256],
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
