import { Logger } from "cables-shared-client";
import CgTexture from "../cg/cg_texture.js";
import { WebGpuContext } from "./cgp_state.js";

export default class Texture extends CgTexture
{
    #log = new Logger("cgp_texture");
    #cgp = null;
    gpuTexture = null;
    gpuTextureDescriptor = null;
    name = "unknown";
    width = 8;
    height = 8;
    textureType = "???";

    samplerDesc = {
        "addressModeU": options.wrap || options.addressModeU || "clamp-to-edge",
        "addressModeV": options.wrap || options.addressModeV || "clamp-to-edge",
        "magFilter": options.magFilter || options.filter || "linear",
        "minFilter": options.minFilter || options.filter || "linear",
    };

    /**
    * @param {WebGpuContext} _cgp
    * @param {Object} options={}
    */
    constructor(_cgp, options = {})
    {
        super(options);
        options = options || {};

        this.#cgp = _cgp;
        if (!this.#cgp) throw new Error("no cgp");

        if (options.name) this.name = options.name;
        if (options.height && options.width) this.setSize(options.width, options.height);

        this.#cgp.on("deviceChange", () =>
        {
        });

    }

    /**
     * @param {Number} w
     * @param {Number} h
     */
    setSize(w, h)
    {
        this.width = w;
        this.height = h;
    }

    /**
     * set texture data from an image/canvas object
     * @function initTexture
     * @memberof Texture
     * @instance
     * @param {Object} img image
     * @param {Number} filter
     */
    initTexture(img, filter)
    {
        this.width = img.width;
        this.height = img.height;

        const textureType = "rgba8unorm";

        this.#cgp.pushErrorScope("inittexture", { "logger": this.#log });

        this.gpuTextureDescriptor = {

            "size": { "width": img.width, "height": img.height },
            "format": textureType,
            // "sampleCount": 4,
            "usage": GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        };

        this.gpuTexture = this.#cgp.device.createTexture(this.gpuTextureDescriptor);
        this.#cgp.device.queue.copyExternalImageToTexture({ "source": img }, { "texture": this.gpuTexture }, this.gpuTextureDescriptor.size);

        this.#cgp.popErrorScope();

        return this.gpuTexture;
    }

    dispose()
    {
        console.log("todo dispose");
    }

    getInfo()
    {
        const obj = {};

        obj.name = this.name || "???";
        obj.size = this.width + " x " + this.height;

        obj.textureType = this.textureType;

        return obj;
    }

    createView()
    {
        if (!this.gpuTexture)
        {
            console.log("no gputexture...");
            return null;
        }
        return this.gpuTexture.createView();
    }

    getSampler()
    {
        // "clamp-to-edge"
        // "repeat"
        // "mirror-repeat"

        return this.samplerDesc;
    }

    /**
     * @function initFromData
     * @memberof Texture
     * @instance
     * @description create texturem from rgb data
     * @param {Array<Number>} data rgb color array [r,g,b,a,r,g,b,a,...]
     * @param {Number} w width
     * @param {Number} h height
     * @param {Number} filter
     * @param {Number} wrap
     */
    initFromData(data, w, h, filter, wrap)
    {
        if (!w || !h) this.#log.error("texture size is 0");
        this.width = w;
        this.height = h;
        this.gpuTexture = this.#cgp.device.createTexture(
            {
                "size": [w, h],
                "format": "rgba8unorm",
                "usage": GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
            });

        this.#cgp.device.queue.writeTexture(
            { "texture": this.gpuTexture },
            data,
            { "bytesPerRow": w * 4 },
            { "width": w, "height": h });
    }

    setWrap(v)
    {
        this.samplerDesc.addressModeU = this.samplerDesc.addressModeV = v;
    }

    setFilter(v)
    {
        this.samplerDesc.minFilter = this.samplerDesc.magFilter = v;
    }
}

/**
 * @function load
 * @static
 * @memberof Texture
 * @description load an image from an url
 * @param {Context} cgp
 * @param {String} url
 * @param {Function} onFinished
 * @param {Object} settings
 * @return {Texture}
 */
Texture.load = function (cgp, url, onFinished, settings)
{
    fetch(url).then((response) =>
    {
        const texture = new Texture(cgp, { "name": url });

        response.blob().then((blob) =>
        {
            createImageBitmap(blob).then((imgBitmap) =>
            {
                texture.initTexture(imgBitmap);
                if (onFinished)onFinished(texture);
                else console.log("Texture.load no onFinished callback");
            }).catch((err) =>
            {
                if (onFinished)onFinished(cgp.getErrorTexture());
            });
        });
    });
};
