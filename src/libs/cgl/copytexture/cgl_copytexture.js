import { MESHES } from "../../../core/cgl/cgl_simplerect";


class CopyTexture
{
    constructor(cgl, name, options)
    {
        this.cgl = cgl;

        this._options = options;
        this.fb = null;

        const shader = options.shader || ""
            .endl() + "UNI sampler2D tex;"
            .endl() + "IN vec2 texCoord;"
            .endl() + "void main()"
            .endl() + "{"
            .endl() + "    vec4 col=texture(tex,texCoord);"
            .endl() + "    outColor= col;"
            .endl() + "}";

        const verts = ""
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

        const textureUniform = new CGL.Uniform(this.bgShader, "t", "tex", 0);

        this.mesh = MESHES.getSimpleRect(this.cgl, "texEffectRect");
    }

    copy(tex)
    {
        if (!tex) return CGL.Texture.getEmptyTexture(this.cgl);
        const
            w = this._options.width || tex.width,
            h = this._options.height || tex.height,
            cgl = this.cgl;

        if (this.fb)
        {
            if (this.fb.getWidth() != w || this.fb.getHeight() != h) this.fb.setSize(w, h);
        }
        else
        {
            let filter = CGL.Texture.FILTER_LINEAR;
            let wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

            if (this._options.hasOwnProperty("filter"))filter = this._options.filter;
            if (this._options.hasOwnProperty("wrap"))wrap = this._options.wrap;

            const options = {
                "isFloatingPointTexture": this._options.isFloatingPointTexture,
                "numRenderBuffers": this._options.numRenderBuffers || 1,
                "filter": filter,
                "wrap": wrap,
            };

            if (cgl.glVersion == 1) this.fb = new CGL.Framebuffer(cgl, w, h, options);
            else this.fb = new CGL.Framebuffer2(cgl, w, h, options);
        }

        cgl.frameStore.renderOffscreen = true;
        this.fb.renderStart(cgl);

        cgl.setTexture(0, tex.tex);

        cgl.pushShader(this.bgShader);
        this.mesh.render(this.bgShader);
        cgl.popShader();

        this.fb.renderEnd();
        cgl.frameStore.renderOffscreen = false;

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
