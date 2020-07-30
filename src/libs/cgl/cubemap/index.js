// TODO: add cubemap convolution
// TODO: add equirectangular to cubemap conversion
// TODO: add clean up functions ?
// TODO: optimize shader "injection", probably not pass it here but set it from outside
const Cubemap = function (cgl, options)
{
    // * internal
    this._cgl = cgl;
    this._framebuffer = null;
    this._depthbuffer = null;
    this._modelMatrix = mat4.create();
    this._projectionMatrix = mat4.perspective(mat4.create(), CGL.DEG2RAD * 90, 1, 0.1, 10.0);
    this._viewMatrix = mat4.create();
    this._lookAtTemp = vec3.fromValues(0, 0, 0);

    this.cubemap = null;
    this.isInitialized = false;
    this.size = options.size || 512;
    this.camPos = options.camPos || vec3.fromValues(0, 0, 0);

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
};

Cubemap.prototype.setCamPos = function (camPos)
{
    this.camPos = camPos || this.camPos;
};

Cubemap.prototype.setSize = function (size)
{
    this.size = size;
    this.isInitialized = false;
    this.initializeCubemap();
};

Cubemap.prototype.initializeCubemap = function ()
{
    let i = 0;

    // checkError(221);

    this.cubemap = this._cgl.gl.createTexture(); // Create the texture object for the reflection map

    // checkError(111);

    this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.cubemap); // create storage for the reflection map images
    this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_MIN_FILTER, this._cgl.gl.LINEAR);
    this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_MAG_FILTER, this._cgl.gl.LINEAR);
    this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_WRAP_S, this._cgl.gl.CLAMP_TO_EDGE);
    this._cgl.gl.texParameteri(this._cgl.gl.TEXTURE_CUBE_MAP, this._cgl.gl.TEXTURE_WRAP_T, this._cgl.gl.CLAMP_TO_EDGE);
    // checkError(122);

    for (i = 0; i < 6; i++)
    {
        if (this._cgl.glVersion == 1)
        {
            if (this._cgl.glUseHalfFloatTex)
            {
                const ext = this._cgl.gl.getExtension("OES_texture_half_float");
                if (this._cgl.glVersion == 1 && !ext) throw new Error("no half float texture extension");

                this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA, this.size, this.size, 0, this._cgl.gl.RGBA, ext.HALF_FLOAT_OES, null);
            }
            else
            {
                const ext = this._cgl.gl.getExtension("OES_texture_float");

                this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA, this.size, this.size, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);
            }
        }
        else this._cgl.gl.texImage2D(this._cubemapProperties[i].face, 0, this._cgl.gl.RGBA32F, this.size, this.size, 0, this._cgl.gl.RGBA, this._cgl.gl.FLOAT, null);

        // With null as the last parameter, the previous function allocates memory for the texture and fills it with zeros.
    }
    // checkError(1);

    this._framebuffer = this._cgl.gl.createFramebuffer(); // crate the framebuffer that will draw to the reflection map

    // checkError(2);

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer); // select the framebuffer, so we can attach the depth buffer to it
    // checkError(3);

    this._depthbuffer = this._cgl.gl.createRenderbuffer(); // renderbuffer for depth buffer in framebuffer
    // checkError(4);
    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer); // so we can create storage for the depthBuffer
    // checkError(5);
    this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER, this._cgl.gl.DEPTH_COMPONENT16, this.size, this.size);
    // checkError(6);
    this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthbuffer);
    // checkError(7);
    // The same framebuffer will be used to draw all six faces of the cubemap.  Each side will be attached
    // as the color buffer of the framebuffer while that side is being drawn.

    // Check form WebGL errors (since I'm not sure all platforms will be able to create the framebuffer)

    // outCubemap.set({ cubemap: this.cubemap });

    this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);
    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);

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
    // uniformLightPos.setValue(light.position);
    // uniformNearFar.setValue([inNear.get(), inFar.get()]);

    this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, this.cubemap);
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._framebuffer);
    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthbuffer);
    this._cgl.gl.viewport(0, 0, this.size, this.size);

    /*    if (this.cullFaces)
    {
        this._cgl.pushCullFace(true);
        this._cgl.pushCullFaceFacing(this.cullFaceFacing);
    } */
    for (let i = 0; i < 6; i += 1) this.renderCubeSide(i, renderFunction);

    /* if (this.cullFaces)
    {
        this._cgl.popCullFace();
        this._cgl.popCullFaceFacing();
    } */

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);
    this._cgl.gl.bindTexture(this._cgl.gl.TEXTURE_CUBE_MAP, null);

    this._cgl.resetViewPort();
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
