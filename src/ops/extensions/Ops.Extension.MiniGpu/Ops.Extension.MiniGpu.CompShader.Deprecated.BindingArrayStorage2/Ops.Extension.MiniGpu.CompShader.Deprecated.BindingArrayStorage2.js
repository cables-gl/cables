const
    exec = op.inTrigger("Trigger"),
    outO = op.inObject("Buffer"),
    type = op.inSwitch("Type", ["read", "read_write", "InOut Flip"], "read_write"),
    inName = op.inString("Name", ""),
    next = op.outTrigger("Next"),
    outBuff = op.outObject("Out Buffer");

let buffer = null;
let binding = null;

let bufferInOut = null;
let bindingInOut = null;

inName.onChange =
    type.onChange = () =>
    {
        buffer = null;
    };

outO.onChange = () =>
{
    buffer = null; // when needed.........???
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;

    if (type.get() == "InOut Flip" && buffer && bufferInOut)
    {
        const encoder = mgpu.device.createCommandEncoder();
        encoder.copyBufferToBuffer(bufferInOut, 0, buffer, 0, buffer.size);
        // encoder.copyBufferToBuffer(buffer, bufferInOut);
        // console.log("buff",buffer);
        // encoder.finish();
        const gpuCommands = encoder.finish();
        mgpu.device.queue.submit([gpuCommands]);
    }

    if (!buffer)
    {
        buffer = outO.get();
        if (!buffer) return;

        const p = (buffer.label || "").split(",");

        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": (inName.get() || p[0]) + "<" + p[1] + ">" });

        /* minimalcore:end */

        if (type.get() == "read" || type.get() == "InOut Flip")
        {

            const layout = {
                "visibility": mgpu.stage,
                "buffer":
                {
                    "type": "read-only-storage"
                }
            };

            binding = {
                "header": "var<storage,read> " + (inName.get() || p[0]) + " : array<" + p[1] + ">;",
                "resource": { "buffer": buffer },
                "layout": layout
            };
            mgpu.rebuildShaderModule = "new buffer read: " + buffer.label;

            outBuff.setRef(buffer);
        }
        else
        if (type.get() == "read_write")
        {
            const layout = {
                "visibility": mgpu.stage,
                "buffer":
                {
                    "type": "storage"
                }
            };

            binding = {
                "header": "var<storage,read_write> " + (inName.get() || p[0]) + " : array<" + p[1] + ">;",
                "resource": { "buffer": buffer },
                "layout": layout
            };
            mgpu.rebuildShaderModule = "new buffer read: " + buffer.label;

            outBuff.setRef(buffer);

        }
        if (type.get() == "InOut Flip")
        {

            const layout = {
                "visibility": mgpu.stage,
                "buffer":
                {
                    "type": "storage"
                }
            };

            // outBuff.setRef(buffer);
            // const layout = {
            //     "visibility": mgpu.stage,
            //     "buffer":
            //     {
            //         "type": "storage"
            //     }
            // };
            bufferInOut = mgpu.device.createBuffer(
                {
                    "size": buffer.size,
                    "label": (inName.get() || p[0]) + "Out," + p[1],
                    "usage": (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)

                });

            bindingInOut = {
                "header": "var<storage,read_write> " + (inName.get() || p[0]) + "Out : array<" + p[1] + ">;",
                "resource": { "buffer": bufferInOut },
                "layout": layout
            };

            mgpu.rebuildShaderModule = "new buffer read: " + buffer.label;
            outBuff.setRef(bufferInOut);
        }
        // else bindingInOut = null;
    }

    if (binding) mgpu.bindings.push(binding);
    if (bindingInOut) mgpu.bindings.push(bindingInOut);

    next.trigger();
};
