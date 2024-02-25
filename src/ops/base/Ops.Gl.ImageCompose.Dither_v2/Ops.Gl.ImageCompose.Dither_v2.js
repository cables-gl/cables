const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    threshold = op.inValueSlider("threshold", 0.35),
    strength = op.inValue("strength", 2),
    inMask = op.inTexture("Mask"),
    inMaskMethod = op.inSwitch("Mask Src", ["R", "1-R"], "R"),
    trigger = op.outTrigger("Trigger");

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.dither_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniMask = new CGL.Uniform(shader, "t", "texMask", 1),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    strengthUniform = new CGL.Uniform(shader, "f", "strength", strength),
    uniWidth = new CGL.Uniform(shader, "f", "width", 0),
    uniHeight = new CGL.Uniform(shader, "f", "height", 0),
    unithreshold = new CGL.Uniform(shader, "f", "threshold", threshold);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

inMaskMethod.onChange =
inMask.onLinkChanged = function ()
{
    shader.toggleDefine("MASK", inMask.isLinked());
    shader.toggleDefine("MASK_SRC_R", inMaskMethod.get() == "R");
    shader.toggleDefine("MASK_SRC_1R", inMaskMethod.get() == "1-R");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inMask.get()) cgl.setTexture(1, inMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
