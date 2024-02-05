const
    render = op.inTrigger("Render"),
    inTex2 = op.inTexture("Texture 1"),
    inFade = op.inFloatSlider("Fade", 0),
    inTex1 = op.inTexture("Texture 2"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.mix_frag);
const
    texUni = new CGL.Uniform(shader, "t", "tex1", 0),
    tex1Uni = new CGL.Uniform(shader, "t", "tex1", 1),
    tex2Uni = new CGL.Uniform(shader, "t", "tex2", 2),
    uniFade = new CGL.Uniform(shader, "f", "fade", inFade);

inTex1.onLinkChanged =
inTex2.onLinkChanged =
    updateDefines;

updateDefines();

function updateDefines()
{
    // shader.toggleDefine("MOD_MASK", inTexMask.get());

    // shader.toggleDefine("MOD_OP_SUB_CX", inOp.get() === "c-x");
    // shader.toggleDefine("MOD_OP_SUB_XC", inOp.get() === "x-c");

    // shader.toggleDefine("MOD_OP_ADD", inOp.get() === "c+x");
    // shader.toggleDefine("MOD_OP_MUL", inOp.get() === "c*x");

    // shader.toggleDefine("MOD_OP_DIV_XC", inOp.get() === "x/c");
    // shader.toggleDefine("MOD_OP_DIV_CX", inOp.get() === "c/x");

    // shader.toggleDefine("MOD_OP_MODULO", inOp.get() === "c%x");
    // shader.toggleDefine("MOD_OP_DISTANCE", inOp.get() === "dist");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTex1.get())cgl.setTexture(1, inTex1.get().tex);
    if (inTex2.get())cgl.setTexture(2, inTex2.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
