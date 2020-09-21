const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    offsetRedX = op.inValue("Red offset X", 0.05),
    offsetRedY = op.inValue("Red offset Y", 0.1),
    offsetGreenX = op.inValue("Green offset X", 0.0),
    offsetGreenY = op.inValue("Green offset Y", 0.0),
    offsetBlueX = op.inValueSlider("Blue offset X", 0),
    offsetBlueY = op.inValueSlider("Blue offset Y", 0),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl);

shader.setSource(shader.getDefaultVertexShader(), attachments.offsetrgb_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    offsetRedUniX = new CGL.Uniform(shader, "f", "offsetRedX", offsetRedX),
    offsetRedUniY = new CGL.Uniform(shader, "f", "offsetRedY", offsetRedY),
    offsetGreenUniX = new CGL.Uniform(shader, "f", "offsetGreenX", offsetGreenX),
    offsetGreenUniY = new CGL.Uniform(shader, "f", "offsetGreenY", offsetGreenY),
    offsetBlueUniX = new CGL.Uniform(shader, "f", "offsetBlueX", offsetBlueX),
    offsetBlueUniY = new CGL.Uniform(shader, "f", "offsetBlueY", offsetBlueY);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

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
