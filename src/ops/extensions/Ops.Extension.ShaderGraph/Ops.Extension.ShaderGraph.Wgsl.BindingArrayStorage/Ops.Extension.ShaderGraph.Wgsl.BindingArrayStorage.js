const
    // exec = op.inTrigger("Trigger"),
    inBuffer = op.inObject("Buffer"),
    type = op.inSwitch("Type", ["read", "read_write", "InOut Flip"], "read_write"),
    inName = op.inString("Name", ""),
    // next = op.outTrigger("Next"),
    outStorage = op.outObject("Storage"),
    outBuff = op.outObject("Out Buffer");

let buffer = null;
let binding = null;

let bufferInOut = null;
let bindingInOut = null;

op.toWorkPortsNeedToBeLinked(inBuffer);

outStorage.onLinkChanged = () =>
{
    setTimeout(reset, 200); // WHYYYYYYYYYYYYYYYYYY
};

inBuffer.onChange =
    inName.onChange =
    type.onChange = reset;

let inbuffer = null;
op.updateShaderModule = update;

function reset()
{
    buffer = null;
    inbuffer = null;

    bufferInOut = null;
    bindingInOut = null;
    // outStorage.setRef(null);
    // outBuff.setRef(null);
}

function copyBuffer(mgpu, src, dst)
{
    if (!src || !dst) return;
    const encoder = mgpu.device.createCommandEncoder();
    encoder.copyBufferToBuffer(src, 0, dst, 0, src.size);
    const gpuCommands = encoder.finish();
    mgpu.device.queue.submit([gpuCommands]);
}

function update(mgpu, bindings)
{

    let setbinding = false;
    inbuffer = inBuffer.get();
    // const mgpu = op.patch.frameStore.mgpu;
    if (buffer && inBuffer.get().label != buffer.label) console.log("label diff", inBuffer.get().label);

    if (!buffer && inbuffer && inBuffer.get() && inBuffer.get().size)
    {

        buffer = mgpu.device.createBuffer(
            {
                "label": inBuffer.get().label,
                "size": inBuffer.get().size,
                "usage": (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)
            });

        copyBuffer(mgpu, inbuffer, buffer);
        // encoder.copyBufferToBuffer(inbuffer, 0, buffer, 0, inbuffer.size);

        const p = (buffer.label || "").split(",");

        /* minimalcore:start */

        if (!buffer) return;

        op.setUiAttrib({ "extendTitle": (inName.get() || p[0]) + "<" + p[1] + ">" });

        /* minimalcore:end */

        if (type.get() == "read" || type.get() == "InOut Flip")
        {

            const layout = {
                "visibility": mgpu.stage,
                "buffer": { "type": "read-only-storage" }
            };

            binding = {
                "header": "var<storage,read> " + (inName.get() || p[0]) + " : array<" + p[1] + ">;",
                "resource": { "buffer": buffer },
                "layout": layout
            };
            mgpu.rebuildShaderModule = "new buffer read: " + buffer.label;

            setbinding = true;
            outBuff.setRef(buffer);
        }
        else
        if (type.get() == "read_write")
        {
            const layout = {
                "visibility": mgpu.stage,
                "buffer": { "type": "storage" }
            };

            binding = {
                "header": "var<storage,read_write> " + (inName.get() || p[0]) + " : array<" + p[1] + ">;",
                "resource": { "buffer": buffer },
                "layout": layout
            };
            mgpu.rebuildShaderModule = "new buffer read: " + buffer.label;

            setbinding = true;
            outBuff.setRef(buffer);

        }
        if (type.get() == "InOut Flip")
        {

            const layout = {
                "visibility": mgpu.stage,
                "buffer": { "type": "storage" }
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
            copyBuffer(mgpu, inbuffer, bufferInOut);

            bindingInOut = {
                "header": "var<storage,read_write> " + (inName.get() || p[0]) + "Out : array<" + p[1] + ">;",
                "resource": { "buffer": bufferInOut },
                "layout": layout
            };

            // mgpu.rebuildShaderModule = "new buffer read: " + buffer.label;
            setbinding = true;
            outBuff.setRef(bufferInOut);
        }
        // else bindingInOut = null;

        op.shaderNode.result.name = op.shaderNode.name = op.shaderNode.resultVarName = inName.get() || p[0];
        op.shaderNode.result.type = p[1];

        op.updateGraph();
        // op.shaderNode.result.port.setRef({});
    }
    if (bindings && setbinding) bindings.push(binding);
    if (bindings && setbinding && bindingInOut) bindings.push(bindingInOut);

    setbinding = false;

    // outBuff.setRef(bufferInOut);
    // next.trigger();
    // if (binding) bindings.push(binding);

    if (type.get() == "InOut Flip" && buffer && bufferInOut)
    {
        copyBuffer(mgpu, bufferInOut, buffer);

        if (outBuff.get() && outBuff.get() != bufferInOut) outBuff.setRef(bufferInOut);
        // outBuff.setRef(bufferInOut);

    }
    else
    {

        copyBuffer(mgpu, inbuffer, buffer);

        if (outBuff.get() && outBuff.get() != buffer) outBuff.setRef(buffer);
    }
}

const defaultName = "storage" + CABLES.simpleId();

new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": inName.get() || defaultName,
        "title": "name",
        "update": update,
        "params": [],
        "result": { "type": "array", "port": outStorage },
        "resultVarName": inName.get() || defaultName
    });
