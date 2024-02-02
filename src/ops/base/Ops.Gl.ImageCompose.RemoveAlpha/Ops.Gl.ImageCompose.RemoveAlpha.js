const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

const srcFrag = ""

    .endl() + "#ifdef HAS_TEXTURES"
    .endl() + "  IN vec2 texCoord;"
    .endl() + "  uniform sampler2D tex;"
    .endl() + "#endif"
    .endl() + ""
    .endl() + ""
    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec4 col=vec4(1.0,0.0,0.0,1.0);"
    .endl() + "   #ifdef HAS_TEXTURES"
    .endl() + "       col=texture2D(tex,texCoord);"
    .endl() + "       col.a=1.0;"
    .endl() + "   #endif"
    .endl() + "   outColor= col;"
    .endl() + "}";

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
