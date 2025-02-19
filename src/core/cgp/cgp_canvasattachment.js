import { WebGpuContext } from "./cgp_state.js";

export class WebGpuCanvasAttachment
{

    /** @type {canvas} */
    #canvas = null;

    /** @type {CgpContext} */
    #cgp = null;

    /** @type {CanvasContext} */
    #ctx = null;

    /**
     * @param {CgpContext} cgp
     */
    constructor(cgp)
    {
        this.#cgp = cgp;
        this.#canvas = document.createElement("canvas");
        this.#canvas.id = "webgpucanvasOut";
        this.#canvas.style.width = 128 + "px";
        this.#canvas.style.height = 128 + "px";
    }

    get canvas()
    {
        return this.#canvas;
    }

    /**
     * @param {function} cb
     */
    render(cb)
    {

        const canvas = this.#cgp.canvas;
        if (this.#canvas.width != canvas.width || this.#canvas.height != canvas.height)
        {
            this.#canvas.style.width = canvas.width + "px";
            this.#canvas.style.height = canvas.height + "px";
            this.#canvas.width = canvas.width;
            this.#canvas.height = canvas.height;
        }

        if (!this.#ctx)
        {
            this.#ctx = this.#canvas.getContext("webgpu");

            if (!this.#ctx)
                return console.log("no context", this.#canvas, this.#ctx);
            this.#ctx.configure({
                "device": this.#cgp.device,
                "format": this.#cgp.presentationFormat
            });

        }

        // const cgp = this.#cgp;
        // cgp.canvasInfo.depthTextureView = this.#ctx.createView();

        this.#cgp.renderPassDescriptor = {
            "label": "preview renderpass",
            "colorAttachments": [
                {
                    "view": this.#ctx.getCurrentTexture().createView(),
                    "loadOp": "clear",
                    "storeOp": "store",
                },

            ],
            "depthStencilAttachment": {
                "view": this.#cgp.canvasInfo.depthTextureView,
                "depthClearValue": 1,
                "depthLoadOp": "clear",
                "depthStoreOp": "store",
            },
        };

        // make a render pass encoder to encode render specific commands
        this.#cgp.passEncoder = this.#cgp.commandEncoder.beginRenderPass(this.#cgp.renderPassDescriptor);
        this.#cgp.textureView = this.#ctx.getCurrentTexture().createView();
        this.#cgp.renderStart();

        cb();

        this.#cgp.tempPrevCanvas = this.#canvas;

        this.#cgp.renderEnd();
        this.#cgp.passEncoder.end();

    }

}
