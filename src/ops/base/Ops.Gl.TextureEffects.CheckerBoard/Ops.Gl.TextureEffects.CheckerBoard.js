const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    lineSize = op.inValue("Size", 10),
    inRotate = op.inValueSlider("Rotate", 0.0),
    inCentered = op.inBool("Centered", false),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "checkerboard");

shader.setSource(shader.getDefaultVertexShader(), attachments.checkerboard_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniLineSize = new CGL.Uniform(shader, "f", "lineSize", lineSize),
    rotateUniform = new CGL.Uniform(shader, "f", "rotate", inRotate);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

inCentered.onChange = () =>
{
    shader.toggleDefine("CENTER", inCentered.get());
};

render.onTriggered = () =>
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
