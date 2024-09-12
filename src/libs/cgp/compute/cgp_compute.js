export default class GpuCompute
{
    constructor(cgp, name, src, options)
    {
        this._name = name;
        this._cgp = cgp;
        this._src = src;
        this._options = options || {};
        this._options.workGroups = this._options.workGroups || [8, 8];

        this._resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * (9999);
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

        const computePipeline = this._cgp.device.createComputePipeline({
            "layout": "auto",
            "compute": {
                "module": shaderModule,
                "entryPoint": "main"
            }
        });

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

        this._passEncoder = commandEncoder.beginComputePass();
        this._passEncoder.setPipeline(computePipeline);
        this._passEncoder.setBindGroup(0, bindGroup);


        if (this._options.workGroups.length == 1) this._passEncoder.dispatchWorkgroups(this._options.workGroups[0] || 8);
        if (this._options.workGroups.length == 2) this._passEncoder.dispatchWorkgroups(this._options.workGroups[0] || 8, this._options.workGroups[1] || 8);
        if (this._options.workGroups.length == 3) this._passEncoder.dispatchWorkgroups(this._options.workGroups[0] || 8, this._options.workGroups[1] || 8, this._options.workGroups[2] || 8);

        this._passEncoder.end();

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

        gpuReadBuffer.mapAsync(GPUMapMode.READ).then(() =>
        {
            if (this._options.read)
            {
                const arrayBuffer = gpuReadBuffer.getMappedRange();
                const b = new Float32Array(arrayBuffer);
                this._options.read({ "buffer": b });
            }
        });
    }
}
