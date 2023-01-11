const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),

    maskInvert = op.inBool("Mask Invert", false),
    mask = op.inTexture("Mask"),

    amount = op.inValueSlider("Amount", 1),
    modulo = op.inValueSlider("modulo", 1),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "texmodulo");

shader.setSource(shader.getDefaultVertexShader(), attachments.invert_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    moduloUniform = new CGL.Uniform(shader, "f", "modulo", modulo),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

maskInvert.onChange =
mask.onChange = () =>
{
    shader.toggleDefine("USE_MASK", mask.isLinked());
    shader.toggleDefine("MASK_INVERT", maskInvert.get());
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (mask.get())cgl.setTexture(1, mask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
