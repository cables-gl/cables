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
        console.log("111");
        return;
    }

    // console.log("inPosBuff.get().size",inPosBuff.get().size);

    if (doRead)
    {
        doRead = false;
        // console.log("buffffffff", inPosBuff.get());
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

        const gpuCommands = commandEncoder.finish();
        mgpu.device.queue.submit([gpuCommands]);

        gpuReadBuffer.mapAsync(GPUMapMode.READ).then(() =>
        {
            const arrayBuffer = gpuReadBuffer.getMappedRange();
            const b = new Float32Array(arrayBuffer);
            outArr.setRef(b);
            // gpuReadBuffer.unmap();
            gpuReadBuffer = null;
            doRead = true;
        });
    }
};
