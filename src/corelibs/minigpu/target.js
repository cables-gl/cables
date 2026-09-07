export class RenderTarget
{

    depthTexture = null;
    viewColor = null;

    /** @type {GPURenderPassEncoder} */
    #passEncoder;

    /**
     * @param {import(".").MgpuState} mgpu
     */
    constructor(mgpu, options = {})
    {

        /* minimalcore:start */
        if (!mgpu)console.warn("rendertarget param mgpu missing");

        /* minimalcore:end */

        this.options = options;
        this.label = options.label || "unknown";
        this.mgpu = mgpu;
        if (!options.hasOwnProperty("sampleCount"))options.sampleCount = 1;

        this.#passEncoder = null;
        this._everStarted = false;

        this.gpuTimeMs = 0;
        this._gpuTimer = null;
        this._gpuTimerPending = false;
        this._measuringGpuTime = false;

        const size = [options.width || mgpu.canvas.width, options.height || mgpu.canvas.height];

        this.depthTexture = mgpu.device.createTexture(
            {
                "size": size,
                "format": "depth24plus",
                "sampleCount": options.sampleCount,
                "usage": GPUTextureUsage.RENDER_ATTACHMENT
            });

        if (options.view)
        {
            this.viewColor = options.view;

        }
        else
        {
            this.colorTexture = mgpu.device.createTexture(
                {
                    "size": size,
                    // "format": "rgba8uint",
                    "format": mgpu.format,
                    "usage": GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
                    "sampleCount": options.sampleCount

                });

            this.viewColor = this.colorTexture.createView();
        }

    }

    get isOpen()
    {
        return this.#passEncoder !== null;
    }

    start()
    {
        if (this.mgpu.target.current()) this.mgpu.target.current().end();

        /** @type {GPURenderPassDescriptor} */
        const renderPassDescriptor = {
            "label": this.label,
            "colorAttachments": [
                {
                    "view": this.viewColor,
                    "clearValue": this.options.clearColor || [0, 0, 0, 1],
                    "loadOp": this.options.loadOp || "clear",
                    "storeOp": "store"
                }
            ],
            "depthStencilAttachment":
            {
                "view": this.depthTexture.createView(),
                "depthClearValue": 1.0,
                "depthLoadOp": "clear",
                "depthStoreOp": "store"
            }
        };

        if (this.options.copyToCanvas)
        {
            if (this.options.sampleCount > 1)
            {
                renderPassDescriptor.colorAttachments[0].resolveTarget = this.mgpu.context.getCurrentTexture().createView();
                renderPassDescriptor.colorAttachments[0].storeOp = "discard";
            }
            else
                renderPassDescriptor.colorAttachments[0].view = this.mgpu.context.getCurrentTexture().createView();
        }

        const hasTimestampQuery = this.mgpu.device.features.has("timestamp-query");
        this._measuringGpuTime = false;// hasTimestampQuery && !this._gpuTimerPending;

        if (this._measuringGpuTime)
        {
            if (!this._gpuTimer)
            {
                this._gpuTimer = {
                    "querySet": this.mgpu.device.createQuerySet({ "type": "timestamp", "count": 2 }),
                    "resolveBuffer": this.mgpu.device.createBuffer({ "size": 16, "usage": GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC }),
                    "resultBuffer": this.mgpu.device.createBuffer({ "size": 16, "usage": GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST })
                };
            }
            renderPassDescriptor.timestampWrites = {
                "querySet": this._gpuTimer.querySet,
                "beginningOfPassWriteIndex": 0,
                "endOfPassWriteIndex": 1
            };
        }

        this.#passEncoder = this.mgpu.commandEncoder.beginRenderPass(renderPassDescriptor);

        this.mgpu.target.push(this);
    }

    get passEncoder()
    {
        if (!this.#passEncoder) this.start();
        return this.#passEncoder;
    }

    end()
    {
        if (this.#passEncoder) this.#passEncoder.end();

        this.#passEncoder = null;
        this.mgpu.target.pop();

        if (this._measuringGpuTime)
        {
            this._measuringGpuTime = false;
            this._gpuTimerPending = true;

            const t = this._gpuTimer;
            const mgpu = this.mgpu;

            mgpu.commandEncoder.resolveQuerySet(t.querySet, 0, 2, t.resolveBuffer, 0);
            mgpu.commandEncoder.copyBufferToBuffer(t.resolveBuffer, 0, t.resultBuffer, 0, 16);

            t.resultBuffer.mapAsync(GPUMapMode.READ).then(() =>
            {
                const times = new BigInt64Array(t.resultBuffer.getMappedRange());
                const ns = times[1] - times[0];
                t.resultBuffer.unmap();
                if (ns > 0n) this.gpuTimeMs = Number(ns) / 1000000;
                console.log("this.gpuTimeMs", this.gpuTimeMs);
                this._gpuTimerPending = false;
            }).catch(() =>
            {
                this._gpuTimerPending = false;
            });
        }
    }

    newFrame()
    {
        if (this.#passEncoder)
            throw new Error("RenderTarget " + this.label + " is still started");

        this._everStarted = false;
    }
}
