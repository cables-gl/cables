class CubemapFramebuffer
{
    constructor(cgl, width, height, options)
    {
        this._cgl = cgl;

        this._depthRenderbuffer = null;
        this._framebuffer = null;
        this._textureFrameBuffer = null;
        this._textureDepth = null;

        this._options = options || {
            "isFloatingPointTexture": false
        };

        if (!this._options.hasOwnProperty("numRenderBuffers")) this._options.numRenderBuffers = 1;
        if (!this._options.hasOwnProperty("depth")) this._options.depth = true;
        if (!this._options.hasOwnProperty("clear")) this._options.clear = true;
        if (!this._options.hasOwnProperty("multisampling"))
        {
            this._options.multisampling = false;
            this._options.multisamplingSamples = 0;
        }

        if (this._options.multisamplingSamples)
        {
            if (this._cgl.glSlowRenderer) this._options.multisamplingSamples = 0;
            if (!this._cgl.gl.MAX_SAMPLES) this._options.multisamplingSamples = 0;
            else this._options.multisamplingSamples = Math.min(this._cgl.gl.getParameter(this._cgl.gl.MAX_SAMPLES), this._options.multisamplingSamples);
        }

        if (!this._options.hasOwnProperty("filter")) this._options.filter = CGL.Texture.FILTER_LINEAR;

        this._colorTexture = this._cgl.gl.createTexture();
    }

    getWidth()
    {
        return this._width;
    }

    getHeight()
    {
        return this._height;
    }

    getGlFrameBuffer()
    {
        return this._framebuffer;
    }

    getDepthRenderBuffer()
    {
        return this._depthRenderbuffer;
    }

    getTextureColor()
    {
        return this._colorTexture;
    }

    getTextureDepth()
    {
        return this._textureDepth;
    }

    dispose()
    {
        this._colorTexture = null; // TODO: remove
        this._cgl.gl.deleteRenderbuffer(this._depthRenderbuffer);
        this._cgl.gl.deleteFramebuffer(this._framebuffer);
        this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);
    }

    delete()
    {
        this.dispose();
    }

    setSize(width, height)
    {
        this._width = Math.floor(width);
        this._height = Math.floor(height);
        this._width = Math.min(this._width, this._cgl.maxTexSize);
        this._height = Math.min(this._height, this._cgl.maxTexSize);

        CGL.profileData.profileFrameBuffercreate++;

        if (this._framebuffer)
        {
            this._cgl.gl.deleteRenderbuffer(this._depthRenderbuffer);
            this._cgl.gl.deleteFramebuffer(this._framebuffer);
            this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);
        }

        this._frameBuffer = this._cgl.gl.createFramebuffer();
        this._textureFrameBuffer = this._cgl.gl.createFramebuffer();

        this._colorTexture.setSize(this._width, this._height); // TODO: this wont work

        // TODO: continue set size later when init works
        // this._render;
    }

    setFilter(filter)
    {
        this._colorTexture.filter = filter;
        this._colorTexture.setSize(this._width, this._height);
    }
}

CGL.CubemapFramebuffer = CubemapFramebuffer;
