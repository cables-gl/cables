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

    this._framebuffer = new CubemapFramebuffer(this._cgl, this.size, this.size, {

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

Cubemap.prototype.hasFramebuffer = function ()
{
    return !!this._framebuffer;
};

Cubemap.prototype.deleteFramebuffer = function ()
{
    if (this._framebuffer) this._framebuffer.dispose();
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

    });
    this.isInitialized = true;
};

Cubemap.prototype.getCubemap = function ()
{
    if (this._framebuffer) return this._framebuffer.getTextureColor();
    return null;
};

Cubemap.prototype.renderCubemap = function (renderFunction)
{
    this._framebuffer.renderStart();

    for (let i = 0; i < 6; i += 1)
    {
        this._framebuffer.renderStartCubemapFace(i);
        if (renderFunction) renderFunction();
        this._framebuffer.renderEndCubemapFace();
    }

    this._framebuffer.renderEnd();
};

CGL.Cubemap = Cubemap;
