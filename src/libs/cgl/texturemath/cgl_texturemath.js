class ShaderTextureMath
{
    constructor(cgl, name, options)
    {
        this._cgl = cgl;
        this._fb = null;
        this._mesh = CGL.MESHES.getSimpleRect(cgl, name + " shaderTexMath rect");
        this._prevViewPort = [0, 0, 0, 0];
        this._w = 0;
        this._h = 0;

        if (options.hasOwnProperty("texturePort")) this._texPort = options.texturePort;
        if (options.hasOwnProperty("width")) this._w = options.width;
        if (options.hasOwnProperty("height")) this._h = options.height;
    }

    dispose()
    {
        if (this._fb) this._fb.delete();
        this._fb = null;
    }

    _initFb(w, h)
    {
        if (this._fb) this._fb.delete();
        this._fb = null;


        if (this._cgl.glVersion >= 2)
        {
            this._fb = new CGL.Framebuffer2(this._cgl, w, h,
                {
                    "isFloatingPointTexture": true,
                    "multisampling": false,
                    "wrap": CGL.Texture.WRAP_REPEAT,
                    "filter": CGL.Texture.FILTER_NEAREST,
                    "depth": true,
                    "multisamplingSamples": 0,
                    "clear": true
                });
        }
        else
        {
            this._fb = new CGL.Framebuffer(this._cgl, w, h,
                {
                    "isFloatingPointTexture": true,
                    "filter": CGL.Texture.FILTER_NEAREST,
                    "wrap": CGL.Texture.WRAP_REPEAT
                });
        }
    }

    setSize(w, h)
    {
        this._w = w;
        this._h = h;
    }

    render(shader)
    {
        if (this._texPort && !this._texPort.get()) return;

        const vp = this._cgl.getViewPort();

        let w = this._w;
        let h = this._h;
        if (this._texPort && this._texPort.get())
        {
            w = this._texPort.get().width;
            h = this._texPort.get().height;
        }
        if (!this._fb || this._fb.getWidth() != w || this._fb.getHeight() != h) this._initFb(w, h);

        if (!shader)
        {
            return null;
            // outTex.set(null);
        }
        else
        {
            this._prevViewPort[0] = vp[0];
            this._prevViewPort[1] = vp[1];
            this._prevViewPort[2] = vp[2];
            this._prevViewPort[3] = vp[3];

            this._fb.renderStart(this._cgl);

            this._cgl.pushPMatrix();
            mat4.identity(this._cgl.pMatrix);

            this._cgl.pushViewMatrix();
            mat4.identity(this._cgl.vMatrix);

            this._cgl.pushModelMatrix();
            mat4.identity(this._cgl.mMatrix);

            this._cgl.pushShader(shader);
            if (shader.bindTextures) shader.bindTextures();

            if (this._texPort)
                this._cgl.setTexture(0, this._texPort.get().tex);

            this._cgl.pushBlend(false);

            this._mesh.render(shader);

            this._cgl.popBlend();

            this._cgl.popPMatrix();
            this._cgl.popModelMatrix();
            this._cgl.popViewMatrix();
            this._fb.renderEnd(this._cgl);

            this._cgl.popShader();

            this._cgl.gl.viewport(this._prevViewPort[0], this._prevViewPort[1], this._prevViewPort[2], this._prevViewPort[3]);

            return this._fb.getTextureColor();
        }
    }
}


export { ShaderTextureMath };
