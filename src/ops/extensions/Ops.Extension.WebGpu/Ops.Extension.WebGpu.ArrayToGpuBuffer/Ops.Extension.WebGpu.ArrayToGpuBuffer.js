const
    inArr = op.inArray("Arr"),
    outBuff = op.outObject("GPUBuffer");

new CABLES.WebGpuOp(op);

let gpuBuff = null;

inArr.onChange = () =>
{
    const arr = inArr.get();
    if (!arr) return;
if(gpuBuff && gpuBuff.getSizeBytes() != arr.length * 4){

    console.log("buff size not corr");
    CABLES.logStack()
}
    if (!gpuBuff || gpuBuff.getSizeBytes() != arr.length * 4)
    {
        gpuBuff = new CABLES.CGP.GPUBuffer(op.patch.cgp, "gpuBuffOp", arr, {
            "buffCfg": {
                "size": arr.length * 4,
                "usage": GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
                // "usage": GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.STORAGE
                // "mappedAtCreation": true
            }
        });
    }

    gpuBuff.setData(arr);
    // gpuBuff.updateGpuBuffer(op.patch.cgp);
    outBuff.setRef(gpuBuff);
};
