const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    offsetRedX = op.inFloat("Red offset X", 0.05),
    offsetRedY = op.inFloat("Red offset Y", 0.1),
    redAmount = op.inFloat("Red amount", 1.0),
    offsetGreenX = op.inFloat("Green offset X", 0.0),
    offsetGreenY = op.inFloat("Green offset Y", 0.0),
    greenAmount = op.inFloat("Green amount", 1.0),
    offsetBlueX = op.inFloat("Blue offset X", 0),
    offsetBlueY = op.inFloat("Blue offset Y", 0),
    blueAmount = op.inFloat("Blue amount", 1.0),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Red", [offsetRedX, offsetRedY, redAmount]);
op.setPortGroup("Green", [offsetGreenX, offsetGreenY, greenAmount]);
op.setPortGroup("Blue", [offsetBlueX, offsetBlueY, blueAmount]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "RGB offset");

shader.setSource(shader.getDefaultVertexShader(), attachments.offsetrgb_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    offsetRedUniX = new CGL.Uniform(shader, "f", "offsetRedX", offsetRedX),
    offsetRedUniY = new CGL.Uniform(shader, "f", "offsetRedY", offsetRedY),
    redUniAmount = new CGL.Uniform(shader, "f", "redAmount", redAmount),

    offsetGreenUniX = new CGL.Uniform(shader, "f", "offsetGreenX", offsetGreenX),
    offsetGreenUniY = new CGL.Uniform(shader, "f", "offsetGreenY", offsetGreenY),
    greenUniAmount = new CGL.Uniform(shader, "f", "greenAmount", greenAmount),

    offsetBlueUniX = new CGL.Uniform(shader, "f", "offsetBlueX", offsetBlueX),
    offsetBlueUniY = new CGL.Uniform(shader, "f", "offsetBlueY", offsetBlueY),
    blueUniAmount = new CGL.Uniform(shader, "f", "blueAmount", blueAmount);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
