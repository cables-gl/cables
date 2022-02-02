import { MESHES } from "../../../core/cgl/cgl_simplerect";


class CopyTexture
{
    constructor(cgl, name, options)
    {
        this.cgl = cgl;

        this.effect = null;
        this._options = options;
        this._fb = null;
        this._prevViewPort = [];

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


        this.bgShader = new CGL.Shader(cgl, "copytexture");
        this.bgShader.setSource(verts, shader);

        const textureUniform = new CGL.Uniform(this.bgShader, "t", "tex", 0);

        // this.effect = new CGL.TextureEffect(this.cgl, { "isFloatingPointTexture": this._options.isFloatingPointTexture, "clear": false });

        this.mesh = MESHES.getSimpleRect(this.cgl, "texEffectRect");

        // this._uniTexInput =

        // console.log(this.effect);
    }

    copy(tex)
    {
        const
            w = this._options.width || tex.width,
            h = this._options.height || tex.height,
            cgl = this.cgl;

        if (this._fb)
        {
            this._fb.setSize(w, h);
        }
        else
        {
            // if (IS_WEBGL_1)
            // {
            //     this._fb = new CGL.Framebuffer(cgl, size, size, {
            //         "isFloatingPointTexture": true,
            //         "filter": CGL.Texture.FILTER_LINEAR,
            //         "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
            //     });
            // }
            // else
            // {
            this._fb = new CGL.Framebuffer2(cgl, w, h, {
                "isFloatingPointTexture": this._options.isFloatingPointTexture,
                "filter": CGL.Texture.FILTER_LINEAR,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            });
            // }
        }

        cgl.frameStore.renderOffscreen = true;
        this._fb.renderStart(cgl);

        cgl.setTexture(0, tex.tex);

        this.mesh.render(this.bgShader);

        this._fb.renderEnd();
        cgl.frameStore.renderOffscreen = false;


        return this._fb.getTextureColor();
    }
}

export { CopyTexture };
