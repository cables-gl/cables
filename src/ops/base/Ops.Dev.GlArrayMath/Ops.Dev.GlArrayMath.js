const
    render = op.inTrigger("Render"),
    inTex = op.inTexture("GlArray"),
    inOp = op.inSwitch("Operation", ["c-x", "x-c", "c+x", "c*x", "x/c", "c/x", "c%x"], "c*x"),
    chanR = op.inBool("R Active", true),
    chanG = op.inBool("G Active", true),
    chanB = op.inBool("B Active", true),
    chanA = op.inBool("A Active", false),
    inTex2 = op.inTexture("Value"),
    r = op.inValue("r", 1),
    g = op.inValue("g", 1),
    b = op.inValue("b", 1),
    a = op.inValue("a", 1),
    trigger = op.outTrigger("trigger"),
    outTex = op.outTexture("Result");

render.onTriggered = dorender;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);
const texMath = new CGL.ShaderTextureMath(cgl, op.objName, { "texturePort": inTex });

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbMath_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const textureUniform2 = new CGL.Uniform(shader, "t", "tex2", 1);

const uniformR = new CGL.Uniform(shader, "f", "r", r);
const uniformG = new CGL.Uniform(shader, "f", "g", g);
const uniformB = new CGL.Uniform(shader, "f", "b", b);
const uniformA = new CGL.Uniform(shader, "f", "a", a);

chanR.onChange =
    chanG.onChange =
    chanB.onChange =
    chanA.onChange =
    inTex2.onChange =
    inOp.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("MOD_OP_SUB_CX", inOp.get() === "c-x");
    shader.toggleDefine("MOD_OP_SUB_XC", inOp.get() === "x-c");

    shader.toggleDefine("MOD_OP_ADD", inOp.get() === "c+x");
    shader.toggleDefine("MOD_OP_MUL", inOp.get() === "c*x");

    shader.toggleDefine("MOD_OP_DIV_XC", inOp.get() === "x/c");
    shader.toggleDefine("MOD_OP_DIV_CX", inOp.get() === "c/x");

    shader.toggleDefine("MOD_OP_MODULO", inOp.get() === "c%x");

    shader.toggleDefine("MOD_USE_TEX", inTex2.get());

    shader.toggleDefine("MOD_CHAN_R", chanR.get());
    r.setUiAttribs({ "greyout": !chanR.get() || inTex2.get() });

    shader.toggleDefine("MOD_CHAN_G", chanG.get());
    g.setUiAttribs({ "greyout": !chanG.get() || inTex2.get() });

    shader.toggleDefine("MOD_CHAN_B", chanB.get());
    b.setUiAttribs({ "greyout": !chanB.get() || inTex2.get() });

    shader.toggleDefine("MOD_CHAN_A", chanA.get());
    a.setUiAttribs({ "greyout": !chanA.get() || inTex2.get() });
}

function dorender()
{
    shader.popTextures();
    if (inTex.get()) shader.pushTexture(textureUniform, inTex.get().tex);
    if (inTex2.get()) shader.pushTexture(textureUniform2, inTex2.get().tex);

    const finTex = texMath.render(shader);

    outTex.set(null);
    outTex.set(finTex);
    trigger.trigger();
}
