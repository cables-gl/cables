const render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    inCenterMode = op.inBool("Center", false),
    inWidth = op.inValueSlider("Width", 0.25),
    inHeight = op.inValueSlider("Height", 0.25),
    inAspect = op.inBool("Aspect Ratio", false),
    inPosX = op.inValueSlider("X", 0.5),
    inPosY = op.inValueSlider("Y", 0.5),
    inRot = op.inValue("Rotate", 0),
    inRoundness = op.inValueSlider("roundness", 0);

const r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1.0);
r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Size", [inWidth, inHeight, inAspect]);
op.setPortGroup("Position", [inPosX, inPosY]);
op.setPortGroup("Color", [r, g, b, a]);

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, "textureeffect rectangle");
shader.setSource(shader.getDefaultVertexShader(), attachments.rectangle_frag || "");
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let uniHeight = new CGL.Uniform(shader, "f", "height", inHeight);
let unWidth = new CGL.Uniform(shader, "f", "width", inWidth);
let uniX = new CGL.Uniform(shader, "f", "x", inPosX);
let uniY = new CGL.Uniform(shader, "f", "y", inPosY);
let uniRot = new CGL.Uniform(shader, "f", "rotate", inRot);
let uniRoundness = new CGL.Uniform(shader, "f", "roundness", inRoundness);

r.set(1.0);
g.set(1.0);
b.set(1.0);
a.set(1.0);

let uniformR = new CGL.Uniform(shader, "f", "r", r);
let uniformG = new CGL.Uniform(shader, "f", "g", g);
let uniformB = new CGL.Uniform(shader, "f", "b", b);
let uniformA = new CGL.Uniform(shader, "f", "a", a);
let uniformAspect = new CGL.Uniform(shader, "f", "aspect", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);
let uniformAmount = new CGL.Uniform(shader, "f", "amount", amount);

inCenterMode.onChange = function ()
{
    shader.toggleDefine("CENTER", inCenterMode.get());
};
render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    const texture = cgl.currentTextureEffect.getCurrentSourceTexture();
    if (inAspect.get()) uniformAspect.set(texture.height / texture.width);
    else uniformAspect.set(1);

    cgl.setTexture(0, texture.tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
