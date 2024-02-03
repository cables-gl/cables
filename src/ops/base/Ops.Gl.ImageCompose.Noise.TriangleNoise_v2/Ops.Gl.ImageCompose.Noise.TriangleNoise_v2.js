const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    scale = op.inValue("scale", 10),
    angle = op.inValue("angle", 0),
    add = op.inValue("Add", 0),
    trigger = op.outTrigger("Next");

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.trianglenoise_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    addUniform = new CGL.Uniform(shader, "f", "add", add),
    scaleUniform = new CGL.Uniform(shader, "f", "scale", scale),
    angleUniform = new CGL.Uniform(shader, "f", "angle", angle),
    ratioUniform = new CGL.Uniform(shader, "f", "ratio", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    ratioUniform.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
