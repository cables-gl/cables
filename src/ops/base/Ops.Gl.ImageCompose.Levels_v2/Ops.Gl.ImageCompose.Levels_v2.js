const
    render = op.inTrigger("Render"),

    inMin = op.inFloatSlider("In Min", 0),
    inMid = op.inFloatSlider("Midpoint", 0.5),
    inMax = op.inFloatSlider("In Max", 1),

    outMin = op.inFloatSlider("Out Min", 0),
    outMax = op.inFloatSlider("Out Max", 1),

    trigger = op.outTrigger("Next");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

const
    uniInMin = new CGL.Uniform(shader, "f", "inMin", inMin),
    uniInMid = new CGL.Uniform(shader, "f", "midPoint", inMid),
    uniInMax = new CGL.Uniform(shader, "f", "inMax", inMax),
    uniOutMin = new CGL.Uniform(shader, "f", "outMin", outMin),
    uniOutMax = new CGL.Uniform(shader, "f", "outMax", outMax),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

shader.setSource(shader.getDefaultVertexShader(), attachments.levels_frag);

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
