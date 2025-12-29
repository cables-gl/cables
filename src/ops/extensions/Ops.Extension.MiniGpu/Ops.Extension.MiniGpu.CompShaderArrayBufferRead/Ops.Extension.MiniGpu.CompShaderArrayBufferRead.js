const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inType = op.inString("Type", "vec4f"),
    inLength = op.inInt("Length"),
    next = op.outTrigger("Next"),
    outO = op.inObject("Buffer");

let buffer = null;
let binding = null;

inLength.onChange =
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
        buffer = outO.get();
        // buffer = mgpu.device.createBuffer({
        // //   label: 'compute-generated vertices',
        //     "size": inLength.get() * 4,
        //     // "usage": GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX|GPUBufferUsage.,
        //     "usage": (GPUBufferUsage.STORAGE)
        //     // "usage": (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)
        //     //  | BufferUsage.VERTEX
        // });

        const layout = {
            "visibility": GPUShaderStage.VERTEX,

            "buffer": {
                "type": "read-only-storage",
            },
        };

        binding = {
            "header": "var<storage,read> " + inName.get() + " : array<" + inType.get() + ">;",
            "resource": { "buffer": buffer, "size": 400 },
            "layout": layout
        };
        outO.setRef(buffer);
    }

    mgpu.bindings.push(binding);

    next.trigger();
};
