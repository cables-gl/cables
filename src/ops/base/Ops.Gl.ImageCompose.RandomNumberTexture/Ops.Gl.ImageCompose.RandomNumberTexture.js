const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),

    inSeed = op.inFloat("Seed", 1),

    inMinR = op.inFloat("Min R", -1),
    inMaxR = op.inFloat("Max R", 1),

    inMinG = op.inFloat("Min G", -1),
    inMaxG = op.inFloat("Max G", 1),

    inMinB = op.inFloat("Min B", -1),
    inMaxB = op.inFloat("Max B", 1),

    inMinA = op.inFloat("Min A", 1),
    inMaxA = op.inFloat("Max A", 1),

    inTexMul = op.inTexture("Multiply"),
    trigger = op.outTrigger("Next");

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniSeed = new CGL.Uniform(shader, "f", "seed", inSeed),
    uniR = new CGL.Uniform(shader, "2f", "r", inMinR, inMaxR),
    uniG = new CGL.Uniform(shader, "2f", "g", inMinG, inMaxG),
    uniB = new CGL.Uniform(shader, "2f", "b", inMinB, inMaxB),
    uniA = new CGL.Uniform(shader, "2f", "a", inMinA, inMaxA),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    mulUniform = new CGL.Uniform(shader, "t", "texMul", 1);

shader.setSource(shader.getDefaultVertexShader(), attachments.noise_frag);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

op.toWorkPortsNeedToBeLinked(render);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexMul.get())cgl.setTexture(1, inTexMul.get().tex);

    cgl.currentTextureEffect.bind();

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
