class CopyTexture
{
    constructor(cgl, name, options)
    {
        this.cgl = cgl;
        this.texCopy = new CGL.Texture(cgl);

        this.effect = null;


        const shader = options.shader ||
             "UNI sampler2D tex;"
                 .endl() + "IN vec2 texCoord;"
                 .endl() + "void main()"
                 .endl() + "{"
                 .endl() + "    vec4 col=texture(tex,texCoord);"
                 .endl() + "    outColor= col;"
                 .endl() + "}";

        this.bgShader = new CGL.Shader(cgl, "copytexture");
        this.bgShader.setSource(this.bgShader.getDefaultVertexShader(), shader);
        const textureUniform = new CGL.Uniform(this.bgShader, "t", "tex", 0);
    }

    copy(tex)
    {
        if (!tex.compareSettings(this.texCopy))
        {
            this.texCopy = tex.clone();

            if (this.effect) this.effect.delete();
            this.effect = new CGL.TextureEffect(this.cgl, { "isFloatingPointTexture": tex.isFloatingPointTexture, "clear": false });
        }

        this.effect.setSourceTexture(tex);

        const cgl = this.cgl;
        const effect = this.effect;

        if (!cgl) return;
        if (!effect) return;

        const prevViewPort = [0, 0, 0, 0];
        const vp = cgl.getViewPort();
        prevViewPort[0] = vp[0];
        prevViewPort[1] = vp[1];
        prevViewPort[2] = vp[2];
        prevViewPort[3] = vp[3];


        const oldEffect = cgl.currentTextureEffect;
        cgl.currentTextureEffect = effect;
        effect.setSourceTexture(tex);

        effect.startEffect();

        // render background color...
        cgl.pushShader(this.bgShader);
        cgl.currentTextureEffect.bind();
        cgl.setTexture(0, tex.tex);
        // if (inTextureMask.get())cgl.setTexture(1, inTextureMask.get().tex);

        cgl.pushBlend(false);

        cgl.currentTextureEffect.finish();
        cgl.popShader();

        cgl.popBlend();

        this.texCopy = effect.getCurrentSourceTexture();

        effect.endEffect();

        cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

        cgl.currentTextureEffect = oldEffect;

        cgl.setTexture(0, CGL.Texture.getEmptyTexture(cgl).tex);


        return this.texCopy;
    }
}

export { CopyTexture };
