let cgl = this.patch.cgl;

const render = op.addInPort(new CABLES.Port(op, "render", CABLES.OP_PORT_TYPE_FUNCTION));
const fade = op.addInPort(new CABLES.Port(op, "fade", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
const fadeWidth = op.addInPort(new CABLES.Port(op, "fadeWidth", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
const image = op.addInPort(new CABLES.Port(op, "image", CABLES.OP_PORT_TYPE_TEXTURE));
const trigger = op.addOutPort(new CABLES.Port(op, "trigger", CABLES.OP_PORT_TYPE_FUNCTION));

let shader = new CGL.Shader(cgl, "wipetransition");

let srcFrag = ""

    .endl() + "#ifdef HAS_TEXTURES"
    .endl() + "  IN vec2 texCoord;"
    .endl() + "  uniform sampler2D tex;"
    .endl() + "  uniform sampler2D image;"
    .endl() + "#endif"

    .endl() + "uniform float fade;"
    .endl() + "uniform float fadeWidth;"
    .endl() + ""
    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec4 col=vec4(0.0,0.0,0.0,1.0);"
    .endl() + "   #ifdef HAS_TEXTURES"
    .endl() + "       col=texture2D(tex,texCoord);"
    .endl() + "       vec4 colWipe=texture2D(image,texCoord);"

    .endl() + "       float w=fadeWidth;"
    .endl() + "       float v=colWipe.r;"
    .endl() + "       float f=fade+fade*w;"

    .endl() + "       if(f<v) col.a=1.0;"
    .endl() + "       else if(f>v+w) col.a=0.0;"
    .endl() + "       else if(f>v && f<=v+w) col.a = 1.0-(f-v)/w; ;"

    .endl() + "   #endif"
    .endl() + "   outColor= col;"
    .endl() + "}";

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let textureDisplaceUniform = new CGL.Uniform(shader, "t", "image", 1);
let fadeUniform = new CGL.Uniform(shader, "f", "fade", 0);
let fadeWidthUniform = new CGL.Uniform(shader, "f", "fadeWidth", 0);

fade.onChange = () =>
{
    fadeUniform.setValue(fade.get());
};

fadeWidth.onChange = () =>
{
    fadeWidthUniform.setValue(fadeWidth.get());
};

fade.set(0.5);
fadeWidth.set(0.2);

render.onTriggered = () =>
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    const img = image.get();
    if (img && img.tex)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

        cgl.setTexture(1, img.tex);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
