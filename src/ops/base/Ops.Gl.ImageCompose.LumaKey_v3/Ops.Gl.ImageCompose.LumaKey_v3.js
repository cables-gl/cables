const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    inInvert = op.inValueBool("Invert"),
    inBlackWhite = op.inValueBool("Black White"),
    inRemoveAlpha = op.inBool("Remove Alpha", true),
    inRemap = op.inBool("Remap", true),
    thresholdLow = op.inValueSlider("Threshold low ", 0.5),
    thresholdHigh = op.inValueSlider("Threshold high", 1.0);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "lumakey");

shader.setSource(shader.getDefaultVertexShader(), attachments.lumakeyV2_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const uniThresholdLow = new CGL.Uniform(shader, "f", "threshholdLow", thresholdLow);
const uniThresholdHigh = new CGL.Uniform(shader, "f", "threshholdHigh", thresholdHigh);

inRemap.onChange =
    inInvert.onChange =
    inBlackWhite.onChange =
    inRemoveAlpha.onChange = updateUi;

updateUi();

function updateUi()
{
    shader.toggleDefine("BLACKWHITE", inBlackWhite.get());
    shader.toggleDefine("INVERT", inInvert.get());
    shader.toggleDefine("REMOVEALPHA", inRemoveAlpha.get());
    shader.toggleDefine("REMAP", inRemap.get());
}

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
