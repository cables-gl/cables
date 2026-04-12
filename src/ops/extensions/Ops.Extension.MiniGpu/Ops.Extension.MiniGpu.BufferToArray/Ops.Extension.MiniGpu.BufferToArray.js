const
    exec = op.inTrigger("Trigger"),
    inPosBuff = op.inObject("Buffer"),
    outArr = op.outArray("Result");

let gpuReadBuffer = null;
let doRead = true;

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!mgpu || !inPosBuff.get() || !inPosBuff.get().size)
    {
        outArr.setRef([]);
        return;
    }

    if (doRead)
    {
        doRead = false;
        if (!gpuReadBuffer)
            gpuReadBuffer = mgpu.device.createBuffer({
                "label": "buffToArr",
                "size": inPosBuff.get().size,
                "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });

        const commandEncoder = mgpu.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(
            inPosBuff.get(),
            0, gpuReadBuffer,
            0, inPosBuff.get().size
        );

        mgpu.device.queue.submit([commandEncoder.finish()]);

        gpuReadBuffer.mapAsync(GPUMapMode.READ).then(() =>
        {
            outArr.setRef(new Float32Array(gpuReadBuffer.getMappedRange()));
            gpuReadBuffer = null;
            doRead = true;
        });
    }
};
