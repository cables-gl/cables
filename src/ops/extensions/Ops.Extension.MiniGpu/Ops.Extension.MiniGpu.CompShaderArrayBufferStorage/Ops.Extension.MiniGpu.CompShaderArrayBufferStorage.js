const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inType = op.inString("Type", "vec4f"),
    inInit = op.inSwitch("Init", ["0", "1", "R"], "0"),
    inNum = op.inInt("Length"),
    next = op.outTrigger("Next"),
    outO = op.outObject("GpuBuffer");

let buffer = null;
let binding = null;

inNum.onChange =
inType.onChange =
inName.onChange = () =>
{
    buffer = null;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!buffer)
    {
        console.log("create buffer", inNum.get());
        buffer = mgpu.device.createBuffer({
            "label": inName.get() + "," + inType.get(),

            //   label: 'compute-generated vertices',
            "size": inNum.get() * 4 * 4,
            // "usage": GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX|GPUBufferUsage.,
            "usage": (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)
            // "usage": (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)
            //  | BufferUsage.VERTEX
        });

        const layout = {
            "visibility": GPUShaderStage.COMPUTE,
            "buffer": {
                "type": "storage",
            },
        };

        const rndarr = [];
        if (inInit.get() == "R")
            for (let i = 0; i < inNum.get(); i++) rndarr[i] = Math.random();

        if (inInit.get() == "1")
            for (let i = 0; i < inNum.get(); i++) rndarr[i] = 1;

        const floatArr = new Float32Array(rndarr);
        mgpu.device.queue.writeBuffer(
            buffer,
            0,
            floatArr.buffer,
            floatArr.byteOffset,
            floatArr.byteLength
        );

        binding = {

            "header": "var<storage, read_write> " + inName.get() + " : array<" + inType.get() + ">;",
            "resource": { "buffer": buffer },
            "layout": layout
        };
        outO.setRef(buffer);

        mgpu.rebuildShaderModule = "new uniform binding: " + inName.get();
    }

    mgpu.bindings.push(binding);

    next.trigger();
};
