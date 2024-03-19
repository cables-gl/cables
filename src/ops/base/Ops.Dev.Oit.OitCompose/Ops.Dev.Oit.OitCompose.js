const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),

    inTexAccum = op.inTexture("OIT Accum"),
    inTexReveal = op.inTexture("OIT Revealage"),
    trigger = op.outTrigger("Trigger");

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name, op);

op.toWorkPortsNeedToBeLinked(inTexAccum, inTexReveal);
shader.setSource(shader.getDefaultVertexShader(), attachments.oit_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniAccum = new CGL.Uniform(shader, "t", "texAccum", 1),
    uniReveal = new CGL.Uniform(shader, "t", "texReveal", 2),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    if (!inTexAccum.isLinked() || !inTexReveal.isLinked())
    {
        return;
    }

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexAccum.get()) cgl.setTexture(1, inTexAccum.get().tex);
    if (inTexReveal.get()) cgl.setTexture(2, inTexReveal.get().tex);

    // cgl.pushBlend(true);
    // cgl.gl.blendFunc(cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.SRC_ALPHA);

    cgl.currentTextureEffect.finish();

    cgl.popBlend();
    cgl.popShader();

    trigger.trigger();
};
