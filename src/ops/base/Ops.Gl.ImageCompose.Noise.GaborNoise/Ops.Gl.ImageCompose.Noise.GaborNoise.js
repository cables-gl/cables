const
    render = op.inTrigger("Render"),

    blendMode = CGL.TextureEffect.AddBlendSelect(op),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),

    amount = op.inValueSlider("Amount", 1),
    inRGB = op.inSwitch("Channels", ["R", "G", "B", "RGB"], "R"),
    inPhase = op.inFloat("Phase", 0),
    inScale = op.inFloat("Scale", 10),
    inOffsetX = op.inFloat("X", 0),
    inOffsetY = op.inFloat("Y", 0),
    trigger = op.outTrigger("Next");

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniMax = new CGL.Uniform(shader, "f", "scale", inScale),
    uniPhase = new CGL.Uniform(shader, "f", "phase", 0),
    uniOff = new CGL.Uniform(shader, "2f", "offset", inOffsetX, inOffsetY),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

shader.setSource(shader.getDefaultVertexShader(), attachments.noise_frag);

// CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);
CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

op.toWorkPortsNeedToBeLinked(render);

inRGB.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("CHAN_R", inRGB.get() == "R");
    shader.toggleDefine("CHAN_G", inRGB.get() == "G");
    shader.toggleDefine("CHAN_B", inRGB.get() == "B");
    shader.toggleDefine("CHAN_RGB", inRGB.get() == "RGB");
}

shader.bindTextures = function ()
{
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    uniPhase.setValue(inPhase.get() % 10);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
