const
    render = op.inTrigger("Render"),
    inOp = op.inSwitch("Operation", ["c-x", "x-c", "c+x", "c*x", "x/c", "c/x", "c%x", "dist"], "c*x"),
    chanR = op.inBool("R Active", true),
    chanG = op.inBool("G Active", true),
    chanB = op.inBool("B Active", true),
    chanA = op.inBool("A Active", false),
    inTexValues = op.inTexture("Texture"),
    r = op.inValue("r", 1),
    g = op.inValue("g", 1),
    b = op.inValue("b", 1),
    a = op.inValue("a", 1),
    mulTex = op.inValue("Multiply Texture", 1),

    inTexMask = op.inTexture("Mask"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbmul_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1),
    tex2 = new CGL.Uniform(shader, "t", "texValues", 2),
    uniformMulTex = new CGL.Uniform(shader, "f", "mulTex", mulTex),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b),
    uniformA = new CGL.Uniform(shader, "f", "a", a);

inTexValues.onLinkChanged =
    inTexMask.onChange =
    chanR.onChange =
    chanG.onChange =
    chanB.onChange =
    chanA.onChange =
    inOp.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("MOD_MASK", inTexMask.get());

    shader.toggleDefine("MOD_OP_SUB_CX", inOp.get() === "c-x");
    shader.toggleDefine("MOD_OP_SUB_XC", inOp.get() === "x-c");

    shader.toggleDefine("MOD_OP_ADD", inOp.get() === "c+x");
    shader.toggleDefine("MOD_OP_MUL", inOp.get() === "c*x");

    shader.toggleDefine("MOD_OP_DIV_XC", inOp.get() === "x/c");
    shader.toggleDefine("MOD_OP_DIV_CX", inOp.get() === "c/x");

    shader.toggleDefine("MOD_OP_MODULO", inOp.get() === "c%x");
    shader.toggleDefine("MOD_OP_DISTANCE", inOp.get() === "dist");

    shader.toggleDefine("MOD_CHAN_R", chanR.get());
    r.setUiAttribs({ "greyout": !chanR.get() || inTexValues.isLinked() });

    shader.toggleDefine("MOD_CHAN_G", chanG.get());
    g.setUiAttribs({ "greyout": !chanG.get() || inTexValues.isLinked() });

    shader.toggleDefine("MOD_CHAN_B", chanB.get());
    b.setUiAttribs({ "greyout": !chanB.get() || inTexValues.isLinked() });

    shader.toggleDefine("MOD_CHAN_A", chanA.get());
    a.setUiAttribs({ "greyout": !chanA.get() || inTexValues.isLinked() });

    mulTex.setUiAttribs({ "greyout": !inTexValues.isLinked() });

    shader.toggleDefine("MOD_USE_VALUETEX", inTexValues.isLinked());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexMask.get())cgl.setTexture(1, inTexMask.get().tex);
    if (inTexValues.get())cgl.setTexture(2, inTexValues.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
