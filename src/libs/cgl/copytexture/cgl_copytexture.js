import { MESHES } from "../../../core/cgl/cgl_simplerect";


class CopyTexture
{
    constructor(cgl, name, options)
    {
        this.cgl = cgl;

        this._options = options;
        this._fb = null;

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
        const
            w = this._options.width || tex.width,
            h = this._options.height || tex.height,
            cgl = this.cgl;

        if (this._fb)
        {
            if (this._fb.getWidth() != w || this._fb.getHeight() != h)
                this._fb.setSize(w, h);
        }
        else
        {
            this._fb = new CGL.Framebuffer2(cgl, w, h, {
                "isFloatingPointTexture": this._options.isFloatingPointTexture,
                "filter": CGL.Texture.FILTER_LINEAR,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            });
        }

        cgl.frameStore.renderOffscreen = true;
        this._fb.renderStart(cgl);

        cgl.setTexture(0, tex.tex);

        cgl.pushShader(this.bgShader);
        this.mesh.render(this.bgShader);
        cgl.popShader();

        this._fb.renderEnd();
        cgl.frameStore.renderOffscreen = false;


        return this._fb.getTextureColor();
    }

    dispose()
    {
        this._fb.dispose();
        this.bgShader.dispose();
        this.mesh.dispose();
    }
}

export { CopyTexture };
