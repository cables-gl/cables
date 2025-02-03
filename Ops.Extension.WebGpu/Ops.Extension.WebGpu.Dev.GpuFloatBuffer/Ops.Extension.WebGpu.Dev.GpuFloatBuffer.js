const
    inArr = op.inArray("Arr"),
    outBuff = op.outObject("GPUBuffer");

new CABLES.WebGpuOp(op);

let gpuBuff = null;

inArr.onChange = () =>
{
    const arr = inArr.get();
    if (!arr) return;

    if (!gpuBuff || gpuBuff.getSizeBytes() != arr.length * 4)
    {
        gpuBuff = new CABLES.CGP.GPUBuffer(op.patch.cgp, "gpuBuffOp", arr, {

            "usage": GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC

        });
    }

    gpuBuff.setData(arr);
    gpuBuff.updateGpuBuffer(op.patch.cgp);
    outBuff.setRef(gpuBuff);
};
