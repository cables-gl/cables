const
    exec = op.inTrigger("Trigger"),
    buff = op.outObject("Buffer"),
    inName = op.inString("Name"),
    inArr = op.inArray("Array");

let buffer = null;
let reInit = true;

inArr.onChange = () =>
{
    reInit = true;
};

exec.onTriggered = () =>
{
    if (reInit)
    {
        reInit = false;
        const mgpu = op.patch.frameStore.mgpu;
        const arr = new Float32Array(inArr.get() || []);

        if (!buffer || arr.length != buffer.size / 4)
        {
            if (buffer) buffer.destroy();

            buffer = mgpu.device.createBuffer({
                "size": arr.byteLength,
                "label": inName.get() + ",vec4f",
                "usage": (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)
            });
        }
        mgpu.device.queue.writeBuffer(buffer, 0, arr);
        buff.setRef(buffer);
    }
};
