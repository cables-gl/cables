const render = op.inTrigger("render"),
    amount = op.inValueSlider("Amount", 1),
    blendMode = CGL.TextureEffect.AddBlendSelect(op),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    inCenterMode = op.inBool("Center", true),
    inWidth = op.inFloat("Width", 0.25),
    inHeight = op.inFloat("Height", 0.25),
    inPosX = op.inFloat("X", 0),
    inPosY = op.inFloat("Y", 0),
    inRot = op.inValue("Rotate", 0),
    inRoundness = op.inValueSlider("roundness", 0),
    r = op.inValueSlider("r", 1.0),
    g = op.inValueSlider("g", 1.0),
    b = op.inValueSlider("b", 1.0),
    a = op.inValueSlider("a", 1.0),
    trigger = op.outTrigger("trigger");

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Size", [inWidth, inHeight]);
op.setPortGroup("Position", [inPosX, inPosY]);
op.setPortGroup("Color", [r, g, b, a]);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, "textureeffect rectangle");
shader.setSource(shader.getDefaultVertexShader(), attachments.rectangle_frag || "");

let textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniHeight = new CGL.Uniform(shader, "f", "height", inHeight),
    unWidth = new CGL.Uniform(shader, "f", "width", inWidth),
    uniX = new CGL.Uniform(shader, "f", "x", inPosX),
    uniY = new CGL.Uniform(shader, "f", "y", inPosY),
    uniRot = new CGL.Uniform(shader, "f", "rotate", inRot),
    uniRoundness = new CGL.Uniform(shader, "f", "roundness", inRoundness),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b),
    uniformA = new CGL.Uniform(shader, "f", "a", a),
    uniformAmount = new CGL.Uniform(shader, "f", "amount", amount),
    uniformAspect = new CGL.Uniform(shader, "f", "aspect", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

inCenterMode.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("CENTER", inCenterMode.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    const texture = cgl.currentTextureEffect.getCurrentSourceTexture();
    uniformAspect.set(cgl.currentTextureEffect.aspectRatio);

    cgl.setTexture(0, texture.tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
