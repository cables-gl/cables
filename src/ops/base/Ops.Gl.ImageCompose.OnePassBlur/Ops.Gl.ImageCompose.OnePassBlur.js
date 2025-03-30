const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),

    inRadius = op.inFloat("Radius", 3),
    mask = op.inTexture("Mask"),
    maskInvert = op.inBool("Mask Invert", false),
    trigger = op.outTrigger("Next");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "onepassblur");

op.setPortGroup("Mask", [mask, maskInvert]);

shader.setSource(attachments.blur_vert, attachments.blur_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniWidth = new CGL.Uniform(shader, "f", "width", 0),
    uniAmount = new CGL.Uniform(shader, "f", "amount", amount),
    uniHeight = new CGL.Uniform(shader, "f", "height", 0),
    uniRadius = new CGL.Uniform(shader, "f", "radius", 0),
    textureAlpha = new CGL.Uniform(shader, "t", "texMask", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

maskInvert.onChange =
    mask.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("USE_MASK", mask.isLinked());
    shader.toggleDefine("MASK_INVERT", maskInvert.get());

    maskInvert.setUiAttribs({ "greyout": !mask.isLinked() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    if (mask.get())cgl.setTexture(1, mask.get().tex);

    cgl.pushShader(shader);
    uniRadius.setValue(inRadius.get());
    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
