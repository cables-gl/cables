const
    render = op.inTrigger("Render"),

    blendMode = CGL.TextureEffect.AddBlendSelect(op),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),

    amount = op.inValueSlider("Amount", 1),
    inSharpness = op.inFloatSlider("sharpness", 0.22),
    inScale = op.inFloat("Scale", 10),
    inRound = op.inBool("Round", false),
    inHarmonics = op.inSwitch("Harmonics", ["1", "2", "3", "4", "5"], "1"),
    inOffsetX = op.inFloat("X", 0),
    inOffsetY = op.inFloat("Y", 0),
    inOffsetZ = op.inFloat("Z", 0),
    trigger = op.outTrigger("Next");

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniMax = new CGL.Uniform(shader, "f", "scale", inScale),
    uniPhase = new CGL.Uniform(shader, "f", "sharpness", inSharpness),
    uniHarmonics = new CGL.Uniform(shader, "f", "harmonics", 1),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1),
    uniOff = new CGL.Uniform(shader, "3f", "offset", inOffsetX, inOffsetY, inOffsetZ),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

shader.setSource(shader.getDefaultVertexShader(), attachments.noise_frag);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

op.toWorkPortsNeedToBeLinked(render);

inRound.onChange = updateDefines;
updateDefines();

inHarmonics.onChange = () =>
{
    uniHarmonics.setValue(parseFloat(inHarmonics.get()));
    shader.toggleDefine("HARMONICS", inHarmonics.get() > 1);
};

function updateDefines()
{
    shader.toggleDefine("ROUND", inRound.get());
}

shader.bindTextures = function ()
{
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
