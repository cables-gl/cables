const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    inZ = op.inFloat("Z"),
    inW = op.inFloat("W", 1),
    next = op.outTrigger("Next");

let binding = null;
let uniformBuffer;
const uniformArray = new Float32Array([0, 0, 0, 0]);

exec.onLinkChanged = () =>
{
    binding = null;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!binding)
    {
        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": inName.get() });
        /* minimalcore:end */

        const layout = {
            "visibility": mgpu.stage,
            "buffer": {
                "type": "uniform",
            },
        };
        uniformBuffer = mgpu.device.createBuffer({
            "size": uniformArray.byteLength,
            "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const type = "vec4f";

        binding = {
            "header": "var<uniform> " + inName.get() + " : " + type + ";",
            "resource": { "buffer": uniformBuffer },
            "layout": layout
        };

        mgpu.rebuildShaderModule = "new uniform binding: " + inName.get();
    }

    uniformArray[0] = inX.get();
    uniformArray[1] = inY.get();
    uniformArray[2] = inZ.get();
    uniformArray[3] = inW.get();

    mgpu.device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    mgpu.bindings.push(binding);

    next.trigger();
};
