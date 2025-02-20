class CopyTexture
{
    constructor(cgl, name, options)
    {
        this.cgl = cgl;

        this._options = options;
        this.fb = null;

        let shader = options.shader;

        this._useDefaultShader = true;
        if (options.shader) this._useDefaultShader = false;

        options.numRenderBuffers = options.numRenderBuffers || 1;

        if (!shader)
        {
            shader = ""
                .endl() + "IN vec2 texCoord;";

            for (let i = 0; i < options.numRenderBuffers; i++)
            {
                shader = shader.endl() + "UNI sampler2D tex" + i + ";".endl();
            }

            shader = shader
                .endl() + "void main()"
                .endl() + "{";

            if (options.numRenderBuffers == 1)
            {
                shader = shader.endl() + "    outColor= texture(tex0,texCoord);".endl();
            }

            else
                for (let i = 0; i < options.numRenderBuffers; i++)
                {
                    shader = shader.endl() + "outColor" + i + " = texture(tex" + i + ",texCoord);".endl();
                }

            shader = shader.endl() + "}";
        }

        const verts = options.vertexShader || ""
            .endl() + "IN vec3 vPosition;"
            .endl() + "IN vec2 attrTexCoord;"

            .endl() + "OUT vec2 texCoord;"

            .endl() + "void main()"
            .endl() + "{"
            .endl() + "   texCoord=attrTexCoord;"
            .endl() + "   gl_Position = vec4(vPosition,  1.0);"
            .endl() + "}";

        this.bgShader = new CGL.Shader(cgl, "corelib copytexture " + name);
        this.bgShader.setSource(verts, shader);

        if (!options.vertexShader)
            this.bgShader.ignoreMissingUniforms = true;

        new CGL.Uniform(this.bgShader, "t", "tex", 0);
        new CGL.Uniform(this.bgShader, "t", "tex1", 1);
        new CGL.Uniform(this.bgShader, "t", "tex2", 2);
        new CGL.Uniform(this.bgShader, "t", "tex3", 3);

        this.mesh = CABLES.CGL.MESHES.getSimpleRect(this.cgl, "texEffectRect");
    }

    setSize(w, h)
    {
        this._options.width = w;
        this._options.height = h;
    }

    copy(tex, tex1, tex2, tex3, tex4)
    {
        const cgl = this.cgl;
        if (!tex) tex = CGL.Texture.getEmptyTexture(this.cgl);
        let
            w = this._options.width || tex.width,
            h = this._options.height || tex.height;

        if (this.fb)
        {
            if (w <= 0)w = 8;
            if (h <= 0)h = 8;
            if (this.fb.getWidth() != w || this.fb.getHeight() != h) this.fb.setSize(w, h);
        }
        else
        {
            let filter = CGL.Texture.FILTER_LINEAR;
            let wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

            if (this._options.isFloatingPointTexture)filter = CGL.Texture.FILTER_NEAREST;

            if (this._options.hasOwnProperty("filter"))filter = this._options.filter;
            if (this._options.hasOwnProperty("wrap"))wrap = this._options.wrap;

            const options =
                {
                    "isFloatingPointTexture": this._options.isFloatingPointTexture,
                    "pixelFormat": this._options.pixelFormat,
                    "numRenderBuffers": this._options.numRenderBuffers || 1,
                    "filter": filter,
                    "wrap": wrap,
                };

            if (cgl.glVersion == 1) this.fb = new CGL.Framebuffer(cgl, w, h, options);
            else this.fb = new CGL.Framebuffer2(cgl, w, h, options);
        }

        cgl.tempData.renderOffscreen = true;
        this.fb.renderStart(cgl);

        cgl.setTexture(0, tex.tex);
        if (tex1) cgl.setTexture(1, tex1.tex);
        if (tex2) cgl.setTexture(2, tex2.tex);
        if (tex3) cgl.setTexture(3, tex3.tex);
        if (tex4) cgl.setTexture(4, tex4.tex);

        cgl.pushShader(this.bgShader);
        this.mesh.render(this.bgShader);
        cgl.popShader();

        this.fb.renderEnd();
        cgl.tempData.renderOffscreen = false;

        return this.fb.getTextureColor();
    }

    dispose()
    {
        if (this.fb) this.fb.dispose();
        if (this.bgShader) this.bgShader.dispose();
        if (this.mesh) this.mesh.dispose();
    }
}

export { CopyTexture };
