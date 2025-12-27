const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    next = op.outTrigger("Next"),
    outO = op.outObject("GpuBuffer");

let buffer = null;

exec.onTriggered = () =>
{
    if (!buffer)
        buffer = device.createBuffer({
            //   label: 'compute-generated vertices',
            "size": vertexBufferSize,
            "usage": GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
        });

    next.trigger();
};
