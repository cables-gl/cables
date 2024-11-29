const
    render = op.inTrigger("render"),
    amount = op.inFloatSlider("Amount", 1),

    mul = op.inFloat("Multiplier", 1),
    inChan = op.inSwitch("name", ["R", "G", "B", "A", "RGB"], "RGB"),

    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "texmodulo");

shader.setSource(shader.getDefaultVertexShader(), attachments.snap_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    mulUniform = new CGL.Uniform(shader, "f", "mul", mul);

inChan.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("CHAN_R", inChan.get() == "R" || inChan.get() == "RGB");
    shader.toggleDefine("CHAN_G", inChan.get() == "G" || inChan.get() == "RGB");
    shader.toggleDefine("CHAN_B", inChan.get() == "B" || inChan.get() == "RGB");
    shader.toggleDefine("CHAN_A", inChan.get() == "A");
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
