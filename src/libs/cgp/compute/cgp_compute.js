export default class GpuCompute
{
    constructor(cgp, name, src)
    {
        this._cgp = cgp;
        this._src = src;
        console.log("hello compute!");


        this._resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * (100);
        this._resultMatrixBuffer = this._cgp.device.createBuffer({
            "size": this._resultMatrixBufferSize,
            "usage": GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });
    }


    compute()
    {
        const shaderModule = this._cgp.device.createShaderModule({
            "code": this._src
        });

        // Pipeline setup

        const computePipeline = this._cgp.device.createComputePipeline({
            "layout": "auto",
            "compute": {
                "module": shaderModule,
                "entryPoint": "main"
            }
        });


        // Bind group

        const bindGroup = this._cgp.device.createBindGroup({
            "layout": computePipeline.getBindGroupLayout(0 /* index */),
            "entries": [
                {
                    "binding": 0,
                    "resource": {
                        "buffer": this._resultMatrixBuffer
                    }
                }
            ]
        });


        // Commands submission

        const commandEncoder = this._cgp.device.createCommandEncoder();

        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, bindGroup);
        // const workgroupCountX = Math.ceil(firstMatrix[0] / 8);
        // const workgroupCountY = Math.ceil(secondMatrix[1] / 8);
        passEncoder.dispatchWorkgroups(64, 1);
        passEncoder.end();

        // Get a GPU buffer for reading in an unmapped state.
        const gpuReadBuffer = this._cgp.device.createBuffer({
            "size": this._resultMatrixBufferSize,
            "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        // Encode commands for copying buffer to buffer.
        commandEncoder.copyBufferToBuffer(
            this._resultMatrixBuffer /* source buffer */,
            0 /* source offset */,
            gpuReadBuffer /* destination buffer */,
            0 /* destination offset */,
            this._resultMatrixBufferSize /* size */
        );

        // Submit GPU commands.
        const gpuCommands = commandEncoder.finish();
        this._cgp.device.queue.submit([gpuCommands]);


        // Read buffer.
        gpuReadBuffer.mapAsync(GPUMapMode.READ).then(() =>
        {
            const arrayBuffer = gpuReadBuffer.getMappedRange();
            console.log(new Float32Array(arrayBuffer));
        });
    }
}
