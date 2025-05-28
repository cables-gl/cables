import { CubemapTexture } from "./cubemaptexture.js";

class CubemapFramebuffer
{
    constructor(cgl, width, height, options)
    {
        this._cgl = cgl;
        this.width = width || 8;
        this.height = height || 8;
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
                "face": this._cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                "lookAt": vec3.fromValues(0.0, -1.0, 0.0),
                "up": vec3.fromValues(0.0, 0.0, -1.0),
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

        this._lookAtTemp = vec3.fromValues(0, 0, 0);
        this.camPos = vec3.fromValues(0, 0, 0);

        this._modelMatrix = mat4.create();
        this._viewMatrix = mat4.create();
        this._projectionMatrix = mat4.perspective(mat4.create(), CGL.DEG2RAD * 90, 1, 0.1, 1000.0);
        this._depthRenderbuffer = null;
        this._framebuffer = null;
        this._depthbuffer = null;
        // this._textureFrameBuffer = null;
        this._textureDepth = null;

        this._options = options || {
            // "isFloatingPointTexture": false
        };

        this.name = this._options.name || "unknown cubemapframebuffer";
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
        if (!this._options.hasOwnProperty("wrap")) this._options.wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

        this._cgl.checkFrameStarted("cubemap framebuffer");

        let pxlFormat = options.pixeFormat;
        if (!pxlFormat && options.isFloatingPointTexture)pxlFormat = CGL.Texture.PFORMATSTR_RGBA32F;

        this.texture = new CubemapTexture(this._cgl, {
            "width": this.width,
            "height": this.height,
            "pixelFormat": options.pixelFormat,
            "filter": this._options.filter,
            "wrap": this._options.wrap,
            "name": this.name + " cubemaptexture"
        });

        this.initializeRenderbuffers();
        this.setSize(this.width, this.height);
    }

    initializeRenderbuffers()
    {
        this._framebuffer = this._cgl.gl.createFramebuffer(); // crate the framebuffer that will draw to the reflection map
        this._depthbuffer = this._cgl.gl.createRenderbuffer(); // renderbuffer for depth buffer in framebuffer

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer

        this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this.width, this.height);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);

        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    }

    getWidth()
    {
        return this.width;
    }

    getHeight()
    {
        return this.height;
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
        return this.texture;
    }

    getTextureDepth()
    {
        return this._textureDepth;
    }

    dispose()
    {
        if (this.texture) this.texture = this.texture.delete();
        if (this._framebuffer) this._cgl.gl.deleteFramebuffer(this._framebuffer);
        if (this._depthRenderbuffer) this._cgl.gl.deleteRenderbuffer(this._depthbuffer);
        // // if (this._textureFrameBuffer) this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);
    }

    delete()
    {
        this.dispose();
    }

    setSize(width, height)
    {
        // console.log("cubemapframebuffer setsize");
        this._cgl.printError("before cubemap setsize");

        this.width = Math.floor(width);
        this.height = Math.floor(height);
        this.width = Math.min(this.width, this._cgl.maxTexSize);
        this.height = Math.min(this.height, this._cgl.maxTexSize);

        this._cgl.profileData.profileFrameBuffercreate++;

        // if (this._framebuffer) this._cgl.gl.deleteFramebuffer(this._framebuffer);
        // if (this._depthRenderbuffer) this._cgl.gl.deleteRenderbuffer(this._depthbuffer);
        // // if (this._textureFrameBuffer) this._cgl.gl.deleteFramebuffer(this._textureFrameBuffer);

        this._framebuffer = this._cgl.gl.createFramebuffer();
        this._depthbuffer = this._cgl.gl.createRenderbuffer();
        this.texture.setSize(this.width, this.height);

        // this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer

        this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this.width, this.height);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);


        if (!this._cgl.gl.isFramebuffer(this._framebuffer))
        {
            console.error("invalid framebuffer...");
            // throw new Error("Invalid framebuffer");
        }


        // * NOTE: if we check for the error in Safari, we get error code 36059 aka 0x8CDB
        // * NOTE: an error that is found in a WebGL extension (WEBGL_draw_buffers) not supported by most iOS devices
        // * NOTE: see https://gist.github.com/TimvanScherpenzeel/2a604e178013a5ac4b411fbcbfd2fa33
        // * NOTE: also, this error is nowhere to be found in the official WebGL 1 spec
        // if (this._cgl.glVersion !== 1)
        // {
        const status = this._cgl.gl.checkFramebufferStatus(this._cgl.gl.FRAMEBUFFER);
        this.checkErrorsByStatus(status);
        // }

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);

        this._cgl.printError("cubemap setsize");
    }

    checkErrorsByStatus(status)
    {
        switch (status)
        {
        case this._cgl.gl.FRAMEBUFFER_COMPLETE:
            break;
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            console.error("FRAMEBUFFER_INCOMPLETE_ATTACHMENT...", this.width, this.height, this.texture.tex, this._depthBuffer);
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            console.error("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            console.error("FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        case this._cgl.gl.FRAMEBUFFER_UNSUPPORTED:
            console.error("FRAMEBUFFER_UNSUPPORTED");
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
        case 0x8CDB:
            console.error("Incomplete: FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER from ext. Or Safari/iOS undefined behaviour.");
            break;
        default:
            console.error("incomplete framebuffer", status);
            console.log(this);
            throw new Error("Incomplete framebuffer: " + status);
        }
    }

    setFilter(filter)
    {
        this.texture.filter = filter;
        this.texture.setSize(this.width, this.height);
    }

    setCamPos(camPos)
    {
        this.camPos = camPos || this.camPos;
    }

    setMatrices(M, V, P)
    {
        this._modelMatrix = M || this._modelMatrix;
        this._viewMatrix = V || this._viewMatrix;
        this._projectionMatrix = P || this._projectionMatrix;
    }

    renderStart()
    {
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer);
        this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer);
        this._cgl.gl.viewport(0, 0, this.width, this.height);
        this._cgl.pushGlFrameBuffer(this._framebuffer);
        this._cgl.pushFrameBuffer(this);
    }

    renderStartCubemapFace(index)
    {
        this._cgl.pushModelMatrix();
        this._cgl.pushViewMatrix();
        this._cgl.pushPMatrix();

        this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cubemapProperties[index].face, this.texture.tex, 0);
        this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);

        if (this._options.clear)
        {
            this._cgl.gl.clearColor(0, 0, 0, 1);
            this._cgl.gl.clear(this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT);
        }

        this.setMatricesCubemapFace(index);
    }

    setMatricesCubemapFace(index)
    {
        mat4.copy(this._cgl.mMatrix, this._modelMatrix);
        vec3.add(this._lookAtTemp, this.camPos, this._cubemapProperties[index].lookAt);

        mat4.lookAt(this._cgl.vMatrix, this.camPos, this._lookAtTemp, this._cubemapProperties[index].up); // V

        mat4.copy(this._cgl.pMatrix, this._projectionMatrix);
    }

    renderEndCubemapFace()
    {
        this._cgl.popPMatrix();
        this._cgl.popModelMatrix();
        this._cgl.popViewMatrix();
    }

    renderEnd()
    {
        this._cgl.profileData.profileFramebuffer++;

        if (this._cgl.glVersion !== 1)
        {
            this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this._framebuffer);
            // this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._textureFrameBuffer);
            // * NOTE: the line below is commented out because it clears the screen to black after
            // * point light shadow map has been rendered
            // this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
        }

        this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popGlFrameBuffer());
        this._cgl.popFrameBuffer();

        this._cgl.resetViewPort();
        this.updateMipMap();
    }

    updateMipMap()
    {
        if (!this.texture) return;

        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.texture.tex);
        this.texture.updateMipMap();
        this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
    }
}

export { CubemapFramebuffer };
