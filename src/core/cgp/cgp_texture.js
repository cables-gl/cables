import { Logger } from "cables-shared-client";

export default class Texture
{
    constructor(_cgp, options)
    {
        if (!_cgp) throw new Error("no cgp");
        this._log = new Logger("cgp_texture");
        this._cgp = _cgp;
        this.id = CABLES.uuid();

        options = options || {};

        this.name = options.name || "unknown";
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

        this.textureType = "rgba8unorm";

        const textureDescriptor = {
            // Unlike in WebGL, the size of our texture must be set at texture creation time.
            // This means we have to wait until the image is loaded to create the texture, since we won't
            // know the size until then.
            "size": { "width": img.width, "height": img.height },
            "format": this.textureType,
            "usage": GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        };
        const texture = this._cgp.device.createTexture(textureDescriptor);

        this._cgp.device.queue.copyExternalImageToTexture({ "source": img }, { "texture": texture }, textureDescriptor.size);

        return texture;
    }

    getInfo()
    {
        const tex = this;
        const obj = {};

        obj.name = tex.name;
        obj.size = tex.width + " x " + tex.height;

        obj.textureType = tex.textureType;

        return obj;
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
        response.blob().then((blob) =>
        {
            createImageBitmap(blob).then((imgBitmap) =>
            {
                const texture = new Texture(cgp, { "name": url });
                texture.initTexture(imgBitmap);
                if (onFinished)onFinished(texture);
                else console.log("Texture.load no onFinished callback");
            });
        });
    });
};
