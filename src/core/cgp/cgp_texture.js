import Logger from "../core_logger";

export default class Texture
{
    constructor(_cgp, options)
    {
        if (!_cgp) throw new Error("no cgp");
        this._log = new Logger("cgp_texture");
        this._cgp = _cgp;
        this.id = CABLES.uuid();
    }

    /**
     * set texture data from an image/canvas object
     * @function initTexture
     * @memberof Texture
     * @instance
     * @param {Object} image
     * @param {Number} filter
     */
    initTexture(img, filter)
    {
        const textureDescriptor = {
        // Unlike in WebGL, the size of our texture must be set at texture creation time.
        // This means we have to wait until the image is loaded to create the texture, since we won't
        // know the size until then.
            "size": { "width": img.width, "height": img.height },
            "format": "rgba8unorm",
            "usage": GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        };
        const texture = this._cgp.device.createTexture(textureDescriptor);

        this._cgp.device.queue.copyExternalImageToTexture({ img }, { texture }, textureDescriptor.size);

        return texture;
    }
}


/**
 * @function load
 * @static
 * @memberof Texture
 * @description load an image from an url
 * @param {Context} cgl
 * @param {String} url
 * @param {Function} onFinished
 * @param {Object} options
 * @return {Texture}
 */
Texture.load = function (cgp, url, onFinished, settings)
{
    // const response = await fetch(url);
    // const blob = await response.blob();
    // const imgBitmap = await createImageBitmap(blob);

    // const texture = new Texture(cgp);
    // texture.initTexture(imgBitmap);
    // onFinished(texture);
};
