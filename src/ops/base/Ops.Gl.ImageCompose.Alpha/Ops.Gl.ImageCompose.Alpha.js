const
    render = op.inTrigger("Render"),
    amount = op.inValueSlider("Amount", 1),
    meth = op.inSwitch("Method", ["Set", "Add", "Sub", "Mul"], "Set"),
    clamp = op.inBool("Clamp", true),
    trigger = op.outTrigger("Next");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "Alpha");
const TEX_SLOT = 0;

shader.setSource(shader.getDefaultVertexShader(), attachments.clearAlpha_frag || "");

const uniformAmount = new CGL.Uniform(shader, "f", "amount", amount);
const textureUniform = new CGL.Uniform(shader, "t", "tex", TEX_SLOT);

clamp.onChange =
    meth.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("METH_NORM", meth.get() == "Set");
    shader.toggleDefine("METH_ADD", meth.get() == "Add");
    shader.toggleDefine("METH_SUB", meth.get() == "Sub");
    shader.toggleDefine("METH_MUL", meth.get() == "Mul");
    shader.toggleDefine("DO_CLAMP", clamp.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(TEX_SLOT, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
