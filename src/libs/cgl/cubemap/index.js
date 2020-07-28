import { CubemapFramebuffer } from "../cubemapframebuffer";

// TODO: add cubemap convolution
// TODO: add equirectangular to cubemap conversion
// TODO: add clean up functions ?
// TODO: optimize shader "injection", probably not pass it here but set it from outside
const Cubemap = function (cgl, options)
{
    // * internal
    this._cgl = cgl;
    this._modelMatrix = mat4.create();
    this._projectionMatrix = mat4.perspective(mat4.create(), CGL.DEG2RAD * 90, 1, 0.1, 10.0);
    this._viewMatrix = mat4.create();
    this._lookAtTemp = vec3.fromValues(0, 0, 0);

    this.cubemap = null;
    this.isInitialized = false;
    this.size = options.size || 512;
    this.camPos = options.camPos || vec3.fromValues(0, 0, 0);
    this.isShadowMap = options.isShadowMap;
    this._framebuffer = new CubemapFramebuffer(this._cgl, this.size, this.size, {
        "forceViewMatrixPush": this.isShadowMap,
    });
    this._framebuffer.setMatrices(this._modelMatrix, null, this._projectionMatrix);
    this._framebuffer.setCamPos(this.camPos);

    this._depthbuffer = null;
    this.depthAttachment = null;
    this.colorAttachment = null;

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
};

Cubemap.prototype.setMatrices = function (M, V, P)
{
    this._modelMatrix = M || this._modelMatrix;
    this._viewMatrix = V || this._viewMatrix;
    this._projectionMatrix = P || this._projectionMatrix;
    this._framebuffer.setMatrices(M, V, P);
};

Cubemap.prototype.setCamPos = function (camPos)
{
    this.camPos = camPos || this.camPos;
    this._framebuffer.setCamPos(this.camPos);
};

Cubemap.prototype.setSize = function (size)
{
    this.size = size;
    this.isInitialized = false;
    this.initializeCubemap();
};

Cubemap.prototype.checkError = function (when)
{
    const err = this._cgl.gl.getError();
    if (err != this._cgl.gl.NO_ERROR)
    {
        console.log("error " + when);
        console.log("error size", this.size);
        if (err == this._cgl.gl.NO_ERROR)console.error("NO_ERROR");
        if (err == this._cgl.gl.OUT_OF_MEMORY)console.error("OUT_OF_MEMORY");
        if (err == this._cgl.gl.INVALID_ENUM)console.error("INVALID_ENUM");
        if (err == this._cgl.gl.INVALID_OPERATION)console.error("INVALID_OPERATION");
        if (err == this._cgl.gl.INVALID_FRAMEBUFFER_OPERATION)console.error("INVALID_FRAMEBUFFER_OPERATION");
        if (err == this._cgl.gl.INVALID_VALUE)console.error("INVALID_VALUE");
        if (err == this._cgl.gl.CONTEXT_LOST_WEBGL)console.error("CONTEXT_LOST_WEBGL");

        // throw "Some WebGL error occurred while trying to create framebuffer.  Maybe you need more resources; try another browser or computer.";
    }
};
Cubemap.prototype.initializeCubemap = function ()
{
    const i = 0;
    this.checkError(221);

    if (!this.cubemap) this.cubemap = new CubemapFramebuffer(this._cgl, this.size, this.size, {

    }); // this._cgl.gl.createTexture(); // Create the texture object for the reflection map

    // this.checkError(111);

    // this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.cubemap); // create storage for the reflection map images
    // this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
    // this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
    // this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
    // this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);
    // this.checkError(122);

    // for (i = 0; i < 6; i++)
    // {
    //     if (this._cgl.glVersion == 1)
    //     {
    //         if (this._cgl.glUseHalfFloatTex)
    //         {
    //             const ext = this._cgl.gl.getExtension("OES_texture_half_float");
    //             if (this._cgl.glVersion == 1 && !ext) throw new Error("no half float texture extension");

    //             this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA, this.size, this.size, 0, this._cgl.gl.RGBA, ext.HALF_FLOAT_OES, null);
    //         }
    //         else
    //         {
    //             const ext = this._cgl.gl.getExtension("OES_texture_float");

    //             this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA, this.size, this.size, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
    //         }
    //     }
    //     else this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA, this.size, this.size, 0, this._cgl.gl.RGBA, this._cgl.gl.UNSIGNED_BYTE, null);
    //     // * NOTE: was gl.RGBA32F && gl.FLOAT instead of gl.RGBA && gl.UNSIGNED_BYTE
    //     // With null as the last parameter, the previous function allocates memory for the texture and fills it with zeros.
    // }
    // this.checkError(1);

    // this._framebuffer = this._cgl.gl.createFramebuffer(); // crate the framebuffer that will draw to the reflection map

    // this.checkError(2);

    // this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
    // this.checkError(3);

    // this._depthbuffer = this._cgl.gl.createRenderbuffer(); // renderbuffer for depth buffer in framebuffer
    // this.checkError(4);
    // this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer
    // this.checkError(5);
    // this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this.size, this.size);
    // this.checkError(6);
    // this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);
    // this.checkError(7);
    // // The same framebuffer will be used to draw all six faces of the cubemap.  Each side will be attached
    // // as the color buffer of the framebuffer while that side is being drawn.

    // // Check form WebGL errors (since I'm not sure all platforms will be able to create the framebuffer)

    // // outCubemap.set({ cubemap: this.cubemap });

    // this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
    // this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
    // this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);

    this.isInitialized = true;
};

Cubemap.prototype.getCubemap = function ()
{
    return {
        "cubemap": this.cubemap,
        "width": this.size,
        "cubeDepthMap": this._depthbuffer,
    };
};

Cubemap.prototype.renderCubemap = function (shader, renderFunction)
{
    this._cgl.pushShader(shader);
    this._framebuffer.renderStart();

    for (let i = 0; i < 6; i += 1)
    {
        this._framebuffer.renderStartCubemapFace(i);
        if (renderFunction) renderFunction();
        this._framebuffer.renderEndCubemapFace();
    }

    this._framebuffer.renderEnd();

    // this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.cubemap.tex);
    // this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer);
    // this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer);
    // this._cgl.gl.viewport(0, 0, this.size, this.size);

    // for (let i = 0; i < 6; i += 1) this.renderCubeSide(i, renderFunction);

    // this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    // this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
    // this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);

    // this._cgl.resetViewPort();
    this._cgl.popShader();
};

Cubemap.prototype.renderCubeSide = function (index, renderFunction)
{
    this._cgl.pushModelMatrix();
    this._cgl.pushViewMatrix();
    this._cgl.pushPMatrix();

    this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cubemapProperties[index].face, this.cubemap, 0);

    this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);


    this._cgl.gl.clearColor(1, 1, 1, 1);

    // * calculate matrices & camPos vector
    mat4.copy(this._cgl.mMatrix, this._modelMatrix); // M

    vec3.add(this._lookAtTemp, this.camPos, this._cubemapProperties[index].lookAt);

    mat4.lookAt(this._cgl.vMatrix, this.camPos, this._lookAtTemp, this._cubemapProperties[index].up); // V
    // mat4.copy(this._cgl.pMatrix, lightProjectionMatrix); // P
    mat4.copy(this._cgl.pMatrix, this._projectionMatrix); // P

    this._cgl.gl.clear(this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT);

    if (renderFunction) renderFunction(); // outTrigger.trigger();

    this._cgl.popPMatrix();
    this._cgl.popModelMatrix();
    this._cgl.popViewMatrix();
};

CGL.Cubemap = Cubemap;
