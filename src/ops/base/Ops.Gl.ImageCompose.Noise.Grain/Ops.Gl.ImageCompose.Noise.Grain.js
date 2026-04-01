const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 0.24),
    animated = op.inValueBool("Animated", true),
    normalize = op.inValueBool("Normalize", false),
    inTexMul = op.inTexture("Multiply"),
    trigger = op.outTrigger("Next"),
    inmean = op.inValueSlider("Mean", 0),
    variance = op.inValueSlider("Variance", 0.5),
    speed = op.inFloat("Speed", 5);

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    timeUniform = new CGL.Uniform(shader, "f", "time", 1.0),
    varianceUni = new CGL.Uniform(shader, "f", "variance", variance),
    meanUni = new CGL.Uniform(shader, "f", "mean", inmean),
    speedUni = new CGL.Uniform(shader, "f", "speed", speed),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    mulUniform = new CGL.Uniform(shader, "t", "texMul", 1);

shader.setSource(shader.getDefaultVertexShader(), attachments.noise_frag);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

op.toWorkPortsNeedToBeLinked(render);

inTexMul.onChange =
normalize.onChange = function ()
{
    shader.toggleDefine("HAS_MULMASK", inTexMul.get());
    shader.toggleDefine("NORMALIZE", normalize.get());
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    if (animated.get()) timeUniform.setValue(op.patch.freeTimer.get() * speed.get());
    else timeUniform.setValue(0);

    cgl.pushShader(shader);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexMul.get())cgl.setTexture(1, inTexMul.get().tex);

    cgl.currentTextureEffect.bind();

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
