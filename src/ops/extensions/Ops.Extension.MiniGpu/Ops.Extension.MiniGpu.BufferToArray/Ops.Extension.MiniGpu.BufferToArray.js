const
    exec = op.inTrigger("Trigger"),
    inPosBuff = op.inObject("Buffer"),
    outArr = op.outArray("Result");

let gpuReadBuffer = null;
let doRead = true;
let copy = null;

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!mgpu || !inPosBuff.get() || !inPosBuff.get().size)
    {
        outArr.setRef(null);
        doRead = true;
        return;
    }

    if (doRead)
    {
        const srcSize = inPosBuff.get().size;
        // console.log("sizeee", srcSize, gpuReadBuffer?.size);
        doRead = false;
        if (!gpuReadBuffer || gpuReadBuffer.size !== srcSize)
            gpuReadBuffer = mgpu.device.createBuffer(
                {
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
            copy = new Float32Array(gpuReadBuffer.getMappedRange().slice(0));
            gpuReadBuffer.unmap();

            // outArr.setRef(new Float32Array(gpuReadBuffer.getMappedRange()));
            // console.log("gpuReadBuffer.getMappedRange()",gpu c x);

            // gpuReadBuffer.unmap();
            // gpuReadBuffer = null;
            doRead = true;

            outArr.setRef(copy);
            // console.log("text", copy);
        });

    }
};
