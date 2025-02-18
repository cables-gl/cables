const
    exec = op.inTrigger("Trigger"),
    inPosBuff = op.inObject("Pos Buffer"),
    outArr = op.outArray("Result");

new CABLES.WebGpuOp(op);

let gpuReadBuffer = null;

exec.onTriggered = () =>
{
    let cgp = op.patch.cgp;
    // console.log(inPosBuff.get())
    if (!cgp || !inPosBuff.get() || !inPosBuff.get().buffCfg)
    {
        outArr.setRef([]);
        return;
    }

    if (!gpuReadBuffer)
    {
        gpuReadBuffer = cgp.device.createBuffer({
            "label": "buffToArr",
            "size": inPosBuff.get().buffCfg.size,
            "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        const commandEncoder = cgp.device.createCommandEncoder();

        commandEncoder.copyBufferToBuffer(
            inPosBuff.get().gpuBuffer /* source buffer */,
            0 /* source offset */,
            gpuReadBuffer /* destination buffer */,
            0 /* destination offset */,
            inPosBuff.get().buffCfg.size /* size */
        );

        const gpuCommands = commandEncoder.finish();
        cgp.device.queue.submit([gpuCommands]);

        gpuReadBuffer.mapAsync(GPUMapMode.READ).then(() =>
        {
            const arrayBuffer = gpuReadBuffer.getMappedRange();
            const b = new Float32Array(arrayBuffer);

            outArr.setRef(b);
            gpuReadBuffer = null;
        });
    }
};
