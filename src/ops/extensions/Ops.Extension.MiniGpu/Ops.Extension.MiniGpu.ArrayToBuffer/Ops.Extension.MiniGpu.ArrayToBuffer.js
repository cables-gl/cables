const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name"),
    inType = op.inString("Type", "vec4f"),
    inArr = op.inArray("Array"),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    buff = op.outObject("Buffer");

let buffer = null;
let reInit = true;
let reset = true;

inType.onChange =
    inArr.onChange = () =>
    {
        reInit = true;
    };

inReset.onTriggered = () =>
{
    reset = true;
};
exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;

    if (reInit)
    {
        reInit = false;
        const arr = new Float32Array(inArr.get() || []);

        if (!buffer || arr.length != buffer.size / 4)
        {
            if (buffer) buffer.destroy();

            buffer = mgpu.device.createBuffer(
                {
                    "size": arr.byteLength,
                    "label": inName.get() + "," + inType.get(),
                    "usage": (GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC)
                });
        }
    }
    if (reset)
    {

        const arr = new Float32Array(inArr.get() || []);
        mgpu.device.queue.writeBuffer(buffer, 0, arr);
        buff.setRef(buffer);
        reset = false;
    }
    next.trigger();
};
