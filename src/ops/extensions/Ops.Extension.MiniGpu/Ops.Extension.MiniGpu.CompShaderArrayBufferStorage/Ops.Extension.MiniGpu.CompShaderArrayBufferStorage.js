const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inLength = op.inInt("Length"),
    next = op.outTrigger("Next"),
    outO = op.outObject("GpuBuffer");

let buffer = null;
let binding = null;

inLength.onChange =
inName.onChange = () =>
{
    buffer = null;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!buffer)
    {
        console.log("create buffer", inLength.get());
        buffer = mgpu.device.createBuffer({
        //   label: 'compute-generated vertices',
            "size": inLength.get() * 4,
            // "usage": GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX|GPUBufferUsage.,
            "usage": (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)
        });

        binding = {
            "header": "var<storage, read_write> " + inName.get() + " : array<Vertex>;",
            "resource": { "buffer": buffer }
        };
        outO.setRef(buffer);
    }

    mgpu.bindings.push(binding);

    next.trigger();
};
