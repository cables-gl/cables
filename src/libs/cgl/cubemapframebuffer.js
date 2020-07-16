class CubemapFramebuffer
{
    constructor(cgl, width, height, options)
    {
        this._cgl = cgl;
        this._cubemapProperties = [
            // targets for use in some gl functions for working with cubemaps
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                "lookAt": vec3.fromValues(1.0, 0.0, 0.0),
                "up": vec3.fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                "lookAt": vec3.fromValues(-1.0, 0.0, 0.0),
                "up": vec3.fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                "lookAt": vec3.fromValues(0.0, 1.0, 0.0),
                "up": vec3.fromValues(0.0, 0.0, 1.0),
            },
            {
                "lookAt": vec3.fromValues(0.0, -1.0, 0.0),
                "up": vec3.fromValues(0.0, 0.0, -1.0),
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                "lookAt": vec3.fromValues(0.0, 0.0, 1.0),
                "up": vec3.fromValues(0.0, -1.0, 0.0),
            },
            {
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                "lookAt": vec3.fromValues(0.0, 0.0, -1.0),
                "up": vec3.fromValues(0.0, -1.0, 0.0),
            },
        ];

        this._depthRenderbuffer = null;
        this._framebuffer = null;
        this._depthbuffer = null;
        this._textureFrameBuffer = null;
        this._textureDepth = null;

        // * TEST PARAMETERS
        this.texture = null;
        this.glFramebuffer = null;
        this.glRenderbuffer = null;


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

    initializeRenderbuffers()
    {
        this._framebuffer = this._cgl.gl.createFramebuffer(); // crate the framebuffer that will draw to the reflection map
        this._depthbuffer = this._cgl.gl.createRenderbuffer(); // renderbuffer for depth buffer in framebuffer

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer

        this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this._width, this._height);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);

        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    }

    initializeTexture()
    {
        this.texture = this._cgl.gl.createTexture(); // Create the texture object for the reflection map
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.cubemap); // create storage for the reflection map images

        // * TODO: add filter & wrap type switch
        this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
        this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
        this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
        this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);

        for (let i = 0; i < 6; i++)
        {
            if (this._cgl.glVersion == 1)
            {
                if (this._cgl.glUseHalfFloatTex)
                {
                    const ext = this._cgl.gl.getExtension("OES_texture_half_float");
                    if (this._cgl.glVersion == 1 && !ext) throw new Error("no half float texture extension");

                    this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA, this._width, this._height, 0, this._cgl.gl.RGBA, ext.HALF_FLOAT_OES, null);
                }
                else
                {
                    const ext = this._cgl.gl.getExtension("OES_texture_float");

                    this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA, this._width, this._height, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
                }
            }
            else this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA, this._width, this._height, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
            // * NOTE: was gl.RGBA32F && gl.FLOAT instead of gl.RGBA && gl.UNSIGNED_BYTE
        }

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);

        this.isInitialized = true;
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

        this._framebuffer = this._cgl.gl.createFramebuffer();
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

    renderStart()
    {
        this._cgl.pushModelMatrix();
        this._cgl.pushPMatrix();

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer);
        this._cgl.gl.viewport(0, 0, this._width, this._height);
        this._cgl.pushGlFrameBuffer(this._framebuffer);
        this._cgl.pushFrameBuffer(this);

        if (this._options.clear)
        {
            this._cgl.gl.clearColor(0, 0, 0, 0);
            this._cgl.gl.clear(this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT);
        }
    }

    renderEnd()
    {
        this._cgl.popPMatrix();
        CGL.profileData.profileFramebuffer++;

        this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this._framebuffer);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._textureFrameBuffer);

        this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);

        // * NOTE: webgl2 only
        // this._cgl.gl.blitFramebuffer(0, 0, this._width, this._height, 0, 0, this._width, this._height, this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT, this._cgl.gl.NEAREST);

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popGlFrameBuffer());
        this._cgl.popFrameBuffer();

        this._cgl.popModelMatrix();
        this._cgl.resetViewPort();

        if (this._colorTexture.filter == CGL.Texture.FILTER_MIPMAP)
        {
            for (let i = 0; i < this._numRenderBuffers; i++)
            {
                this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, this._colorTexture.tex);
                this._colorTexture.updateMipMap();
                this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_2D, null);
            }
        }
    }
}

CGL.CubemapFramebuffer = CubemapFramebuffer;
