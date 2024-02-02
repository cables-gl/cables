let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

const blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
const amount = op.inValueSlider("Amount", 1);

let inGradient = op.inTexture("Gradient");
let inMethod = op.inSwitch("Method", ["Luminance", "Channels"], "Luminance");

let inMin = op.inFloatSlider("Min", 0);
let inMax = op.inFloatSlider("Max", 1);

let inPos = op.inValueSlider("Position", 0.5);

op.setPortGroup("Vertical Position", [inMin, inMax, inPos]);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);
shader.define("METH_LUMI");

shader.setSource(shader.getDefaultVertexShader(), attachments.colormap_frag);
var textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

var textureUniform = new CGL.Uniform(shader, "t", "gradient", 1);
let uniPos = new CGL.Uniform(shader, "f", "pos", inPos);

let uniMin = new CGL.Uniform(shader, "f", "vmin", inMin);
let uniMax = new CGL.Uniform(shader, "f", "vmax", inMax);
let uniAmount = new CGL.Uniform(shader, "f", "amount", amount);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

inMethod.onChange = () =>
{
    shader.toggleDefine("METH_LUMI", inMethod.get() == "Luminance");
    shader.toggleDefine("METH_CHANNELS", inMethod.get() == "Channels");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    if (!inGradient.get()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.setTexture(1, inGradient.get().tex);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, inGradient.get().tex );

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
