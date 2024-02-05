const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    tone = op.inValueSelect("Tone", ["Highlights", "Midtones", "Shadows"], "Highlights"),
    r = op.inValue("r"),
    g = op.inValue("g"),
    b = op.inValue("b");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.colorbalance_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniR = new CGL.Uniform(shader, "f", "r", r),
    uniG = new CGL.Uniform(shader, "f", "g", g),
    uniB = new CGL.Uniform(shader, "f", "b", b);

tone.onChange = function ()
{
    shader.toggleDefine("TONE_HIGH", tone.get() == "Highlights");
    shader.toggleDefine("TONE_MID", tone.get() == "Midtones");
    shader.toggleDefine("TONE_LOW", tone.get() == "Shadows");
};

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
