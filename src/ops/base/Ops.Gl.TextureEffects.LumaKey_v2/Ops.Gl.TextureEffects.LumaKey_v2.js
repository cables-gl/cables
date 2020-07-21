const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    inInvert = op.inValueBool("Invert"),
    inBlackWhite = op.inValueBool("Black White"),
    thresholdLow = op.inValueSlider("Threshold low ", 0.5),
    thresholdHigh = op.inValueSlider("Threshold high", 1.0);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "lumakey");

shader.setSource(shader.getDefaultVertexShader(), attachments.lumakeyV2_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const uniThresholdLow = new CGL.Uniform(shader, "f", "threshholdLow", thresholdLow);
const uniThresholdHigh = new CGL.Uniform(shader, "f", "threshholdHigh", thresholdHigh);

inBlackWhite.onChange = function ()
{
    if (inBlackWhite.get()) shader.define("BLACKWHITE");
    else shader.removeDefine("BLACKWHITE");
};

inInvert.onChange = function ()
{
    if (inInvert.get()) shader.define("INVERT");
    else shader.removeDefine("INVERT");
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
