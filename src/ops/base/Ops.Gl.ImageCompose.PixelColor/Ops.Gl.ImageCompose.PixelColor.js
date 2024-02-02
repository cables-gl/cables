const render = op.inTrigger("render"),
    srcTex = op.inTexture("Source Texture"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    posX = op.inFloatSlider("Pos X", 0),
    posY = op.inFloatSlider("Pos Y", 0),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.pixelate_frag);

const textureMultiplierUniform = new CGL.Uniform(shader, "t", "srcTex", 1);
const unipos = new CGL.Uniform(shader, "2f", "pixelPos", posX, posY);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

// srcTex.onChange = function ()
// {
//     shader.toggleDefine("PI XELATE_TEXTURE", srcTex.isLinked());
// };

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (srcTex.get()) cgl.setTexture(1, srcTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
