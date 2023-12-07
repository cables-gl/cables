let render = op.inTrigger("render");
let blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
let amount = op.inValueSlider("Amount", 1);
let inSize = op.inValueSlider("size");
let inInner = op.inValueSlider("Inner");
let inStretch = op.inValueSlider("Stretch");

let inX = op.inValue("Pos X", 0.5);
let inY = op.inValue("Pos Y", 0.5);

let fallOff = op.inValueSelect("fallOff", ["Linear", "SmoothStep"], "Linear");
let inFadeOut = op.inValueSlider("fade Out");
let warnOverflow = op.inValueBool("warn overflow", true);

const r = op.inValueSlider("r", 1);
const g = op.inValueSlider("g", 1);
const b = op.inValueSlider("b", 1);
const a = op.inValueSlider("a", 1);

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Size", [inSize, inInner, inStretch]);
op.setPortGroup("Position", [inX, inY]);
op.setPortGroup("Style", [warnOverflow, fallOff, inFadeOut]);

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, "textureeffect stripes");
shader.setSource(shader.getDefaultVertexShader(), attachments.circle_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

let uniStretch = new CGL.Uniform(shader, "f", "stretch", inStretch);
let uniSize = new CGL.Uniform(shader, "f", "size", inSize);
let uniFadeOut = new CGL.Uniform(shader, "f", "fadeOut", inFadeOut);
let uniInner = new CGL.Uniform(shader, "f", "inner", inInner);
let aspect = new CGL.Uniform(shader, "f", "aspect", 1);

inSize.set(0.25);

setFallOf();
setWarnOverflow();

let uniformR = new CGL.Uniform(shader, "f", "r", r);
let uniformG = new CGL.Uniform(shader, "f", "g", g);
let uniformB = new CGL.Uniform(shader, "f", "b", b);
let uniformA = new CGL.Uniform(shader, "f", "a", a);

let uniformX = new CGL.Uniform(shader, "f", "x", inX);
let uniformY = new CGL.Uniform(shader, "f", "y", inY);

fallOff.onChange = setFallOf;
warnOverflow.onChange = setWarnOverflow;

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

function setFallOf()
{
    shader.removeDefine("FALLOFF_LINEAR");
    shader.removeDefine("FALLOFF_SMOOTHSTEP");

    if (fallOff.get() == "Linear") shader.define("FALLOFF_LINEAR");
    if (fallOff.get() == "SmoothStep") shader.define("FALLOFF_SMOOTHSTEP");
}

function setWarnOverflow()
{
    if (warnOverflow.get()) shader.define("WARN_OVERFLOW");
    else shader.removeDefine("WARN_OVERFLOW");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    let a = cgl.currentTextureEffect.getCurrentSourceTexture().height / cgl.currentTextureEffect.getCurrentSourceTexture().width;
    aspect.set(a);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
