const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    mode = op.inValueSelect("Mode", ["Sine", "Sawtooth", "Triangle", "Square"], "Sine"),
    freq = op.inValue("Frequency", 4),
    pow = op.inValue("Pow factor", 6),
    offset = op.inValue("Offset", 0),
    rotate = op.inFloatSlider("Rotate", 0),
    r = op.inValueSlider("r", 1.0),
    g = op.inValueSlider("g", 1.0),
    b = op.inValueSlider("b", 1.0),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Waveform", [mode, freq, pow, offset, rotate]);
op.setPortGroup("Color", [r, g, b]);
r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.waveform_v2_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    freqUniform = new CGL.Uniform(shader, "f", "uFreq", freq),
    offsetUniform = new CGL.Uniform(shader, "f", "uOffset", offset),
    powUniform = new CGL.Uniform(shader, "f", "uPow", pow),
    rotateUniform = new CGL.Uniform(shader, "f", "uRotate", rotate),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);
mode.onChange = updateMode;
updateMode();

function updateMode()
{
    shader.toggleDefine("MODE_SAW", mode.get() == "Sawtooth");
    shader.toggleDefine("MODE_SINE", mode.get() == "Sine");
    shader.toggleDefine("MODE_TRI", mode.get() == "Triangle");
    shader.toggleDefine("MODE_SQR", mode.get() == "Square");
}

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
