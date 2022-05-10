const render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    inSquare = op.inBool("Square", true),
    numX = op.inValue("Num X", 10),
    numY = op.inValue("Num Y", 10),
    inRotate = op.inValueSlider("Rotate", 0.0),
    inCentered = op.inBool("Centered", true),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "checkerboard");

shader.setSource(shader.getDefaultVertexShader(), attachments.checkerboard_frag);

const textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniNumX = new CGL.Uniform(shader, "f", "numX", numX),
    uniNumY = new CGL.Uniform(shader, "f", "numY", numY),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1),
    rotateUniform = new CGL.Uniform(shader, "f", "rotate", inRotate);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

inSquare.onChange =
inCentered.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("CENTER", inCentered.get());
    shader.toggleDefine("SQUARE", inSquare.get());

    numY.setUiAttribs({ "greyout": inSquare.get() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    uniAspect.set(cgl.currentTextureEffect.aspectRatio);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
