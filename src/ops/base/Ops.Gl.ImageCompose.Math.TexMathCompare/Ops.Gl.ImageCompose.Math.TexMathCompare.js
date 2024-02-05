const
    render = op.inTrigger("Render"),
    inComp = op.inSwitch("Comparison", [">", "<", "=="], ">"),
    inResult = op.inSwitch("Result", ["0,1", "0,pass"], "0,1"),
    inNumber = op.inFloat("Number", 1),

    chanR = op.inBool("R Active", true),
    chanG = op.inBool("G Active", true),
    chanB = op.inBool("B Active", true),
    chanA = op.inBool("A Active", false),

    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.logic_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uni1 = new CGL.Uniform(shader, "f", "val", inNumber);

inComp.onChange =
    inResult.onChange =
    chanR.onChange =
    chanG.onChange =
    chanB.onChange =
    chanA.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("PASSVALUE", inResult.get() === "0,pass");

    shader.toggleDefine("COMP_GR", inComp.get() === ">");
    shader.toggleDefine("COMP_SM", inComp.get() === "<");
    shader.toggleDefine("COMP_EQ", inComp.get() === "==");

    shader.toggleDefine("MOD_CHAN_R", chanR.get());
    shader.toggleDefine("MOD_CHAN_G", chanG.get());
    shader.toggleDefine("MOD_CHAN_B", chanB.get());
    shader.toggleDefine("MOD_CHAN_A", chanA.get());
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
