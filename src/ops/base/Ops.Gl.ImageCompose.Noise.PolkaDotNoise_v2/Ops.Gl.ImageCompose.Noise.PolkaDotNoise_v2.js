const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    inBox = op.inValueBool("Square Look", false),
    threshhold = op.inValueSlider("Threshold", 0.25),
    radius_low = op.inValueSlider("Radius Low", 0),
    radius_high = op.inValueSlider("Radius High", 1),
    scale = op.inValue("Scale", 14),
    X = op.inValue("X", 0),
    Y = op.inValue("Y", 0),
    Z = op.inValue("Z", 0),
    trigger = op.outTrigger("Next");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
let timeUniform = new CGL.Uniform(shader, "f", "time", 1.0);

shader.setSource(CGL.Shader.getDefaultVertexShader(), attachments.polkadotnoise_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
radius_low.uniform = new CGL.Uniform(shader, "f", "radius_low", radius_low);
radius_high.uniform = new CGL.Uniform(shader, "f", "radius_high", radius_high);
X.uniform = new CGL.Uniform(shader, "f", "X", X);
Y.uniform = new CGL.Uniform(shader, "f", "Y", Y);
Z.uniform = new CGL.Uniform(shader, "f", "Z", Z);
scale.uniform = new CGL.Uniform(shader, "f", "scale", scale);
const uniaspect = new CGL.Uniform(shader, "f", "aspect", 1);
const uniThreshhold = new CGL.Uniform(shader, "f", "threshhold", threshhold);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

inBox.onChange = function ()
{
    if (inBox.get())shader.define("BOX");
    else shader.removeDefine("BOX");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    uniaspect.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
