const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    amountX = op.inValue("x", 3),
    amountY = op.inValue("y", 3),
    trigger = op.outTrigger("trigger"),
    inClear = op.inBool("Clear", true),
    mulTex = op.inTexture("Multiply");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.repeat_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMulUniform = new CGL.Uniform(shader, "t", "mulTex", 2),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    amountXUniform = new CGL.Uniform(shader, "f", "amountX", amountX),
    amountYUniform = new CGL.Uniform(shader, "f", "amountY", amountY);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

inClear.onChange =
mulTex.onChange = updateDefines;

function updateDefines()
{
    shader.toggleDefine("CLEAR", inClear.get());
    shader.toggleDefine("HAS_MASK", mulTex.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (mulTex.get())cgl.setTexture(2, mulTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
