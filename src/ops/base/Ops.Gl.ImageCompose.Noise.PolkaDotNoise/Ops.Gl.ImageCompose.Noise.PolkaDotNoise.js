let render = op.inTrigger("Render");

let blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
let amount = op.inValueSlider("Amount", 1);
const inBox = op.inValueBool("Square Look", false);
const threshhold = op.inValueSlider("Threshold", 0.25);
let radius_low = op.inValueSlider("Radius Low", 0);
let radius_high = op.inValueSlider("Radius High", 1);
let scale = op.inValue("Scale", 10);
let X = op.inValue("X", 0);
let Y = op.inValue("Y", 0);
let Z = op.inValue("Z", 0);
let trigger = op.outTrigger("Next");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
let timeUniform = new CGL.Uniform(shader, "f", "time", 1.0);

shader.setSource(shader.getDefaultVertexShader(), attachments.polkadotnoise_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
radius_low.uniform = new CGL.Uniform(shader, "f", "radius_low", radius_low);
radius_high.uniform = new CGL.Uniform(shader, "f", "radius_high", radius_high);
X.uniform = new CGL.Uniform(shader, "f", "X", X);
Y.uniform = new CGL.Uniform(shader, "f", "Y", Y);
Z.uniform = new CGL.Uniform(shader, "f", "Z", Z);
scale.uniform = new CGL.Uniform(shader, "f", "scale", scale);
const uniThreshhold = new CGL.Uniform(shader, "f", "threshhold", threshhold);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

inBox.onChange = function ()
{
    if (inBox.get())shader.define("BOX");
    else shader.removeDefine("BOX");
};

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
