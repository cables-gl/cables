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
                    // "clearValue": [0, 1, 0, 0],
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
    }

    newFrame()
    {
        if (this.#passEncoder)
            throw new Error("RenderTarget " + this.label + " is still started");

        this._everStarted = false;
    }
}
