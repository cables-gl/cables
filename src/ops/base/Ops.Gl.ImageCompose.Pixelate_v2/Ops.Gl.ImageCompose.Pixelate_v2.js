const render = op.inTrigger("render"),
    multiplierTex = op.inTexture("Multiplier"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    amountX = op.inValue("width", 100),
    amountY = op.inValue("height", 100),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.pixelate_frag);

const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const textureMultiplierUniform = new CGL.Uniform(shader, "t", "multiplierTex", 1);
const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
const amountXUniform = new CGL.Uniform(shader, "f", "amountX", amountX);
const amountYUniform = new CGL.Uniform(shader, "f", "amountY", amountY);

multiplierTex.onChange = function ()
{
    shader.toggleDefine("PIXELATE_TEXTURE", multiplierTex.isLinked());
};

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (multiplierTex.get()) cgl.setTexture(1, multiplierTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
