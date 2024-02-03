const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    maskInvert = op.inBool("Mask Invert", false),
    mask = op.inTexture("Mask"),
    invertR = op.inBool("Invert R", true),
    invertG = op.inBool("Invert G", true),
    invertB = op.inBool("Invert B", true),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.invert_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

maskInvert.onChange =
    invertR.onChange =
    invertG.onChange =
    invertB.onChange =
    mask.onLinkChanged = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("USE_MASK", mask.isLinked());
    shader.toggleDefine("MASK_INVERT", maskInvert.get());

    shader.define("INVR", invertR.get() ? "1.0" : "0.0");
    shader.define("INVG", invertG.get() ? "1.0" : "0.0");
    shader.define("INVB", invertB.get() ? "1.0" : "0.0");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (mask.get())cgl.setTexture(1, mask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
