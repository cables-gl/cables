const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    next = op.outTrigger("Next"),
    outO = op.outObject("GpuBuffer");

let buffer = null;
let size = 0;

exec.onTriggered = () =>
{
    if (!buffer)
    {
        const device = op.patch.frameStore.mgpu.device;
        buffer = device.createBuffer({
        //   label: 'compute-generated vertices',
            "size": size,
            "usage": GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
        });
        const binding = {
            "header": "var<storage, read_write> vertices : array<Vertex>;",
            "resource": { "buffer": buffer }

        };
    }

    next.trigger();
};
