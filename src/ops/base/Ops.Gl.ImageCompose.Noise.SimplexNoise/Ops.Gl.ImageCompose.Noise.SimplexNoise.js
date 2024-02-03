const
    render = op.inTrigger("render"),
    inTexMask = op.inTexture("Mask"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    smoothness = op.inValue("smoothness", 1.0),
    inHarmonics = op.inSwitch("Harmonics", ["1", "2", "3", "4", "5"], "1"),
    scale = op.inValue("scale", 1.0),
    inAspect = op.inBool("Aspect", false),
    trigger = op.outTrigger("trigger"),
    x = op.inValue("x"),
    y = op.inValue("y"),
    time = op.inValue("time", 0.314);

const
    inTexOffsetZ = op.inTexture("Offset"),
    inOffsetMul = op.inFloat("Offset Multiply", 1),
    offsetX = op.inSwitch("Offset X", ["None", "R", "G", "B"], "None"),
    offsetY = op.inSwitch("Offset Y", ["None", "R", "G", "B"], "None"),
    offsetZ = op.inSwitch("Offset Z", ["None", "R", "G", "B"], "R");

op.setPortGroup("Offset Map", [inTexOffsetZ, offsetZ, offsetY, offsetX, inOffsetMul]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.simplexnoise_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureUniformOffZ = new CGL.Uniform(shader, "t", "texOffsetZ", 1),
    uniTexMask = new CGL.Uniform(shader, "t", "texMask", 2),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniSmoothness = new CGL.Uniform(shader, "f", "smoothness", smoothness),
    uniScale = new CGL.Uniform(shader, "f", "scale", scale),
    uniX = new CGL.Uniform(shader, "f", "x", x),
    uniY = new CGL.Uniform(shader, "f", "y", y),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1),
    uniTime = new CGL.Uniform(shader, "f", "time", time),
    uniOffMul = new CGL.Uniform(shader, "f", "offMul", inOffsetMul),
    uniHarmonics = new CGL.Uniform(shader, "f", "harmonics", 0);

inHarmonics.onChange = () =>
{
    uniHarmonics.setValue(parseFloat(inHarmonics.get()));
};

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

offsetX.onChange =
offsetY.onChange =
offsetZ.onChange =
inTexMask.onChange =
inTexOffsetZ.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("HAS_TEX_OFFSETMAP", inTexOffsetZ.get());
    shader.toggleDefine("HAS_TEX_MASK", inTexMask.get());

    shader.toggleDefine("OFFSET_X_R", offsetX.get() == "R");
    shader.toggleDefine("OFFSET_X_G", offsetX.get() == "G");
    shader.toggleDefine("OFFSET_X_B", offsetX.get() == "B");

    shader.toggleDefine("OFFSET_Y_R", offsetY.get() == "R");
    shader.toggleDefine("OFFSET_Y_G", offsetY.get() == "G");
    shader.toggleDefine("OFFSET_Y_B", offsetY.get() == "B");

    shader.toggleDefine("OFFSET_Z_R", offsetZ.get() == "R");
    shader.toggleDefine("OFFSET_Z_G", offsetZ.get() == "G");
    shader.toggleDefine("OFFSET_Z_B", offsetZ.get() == "B");

    offsetX.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    offsetY.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    offsetZ.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    inOffsetMul.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    if (inAspect.get()) uniAspect.setValue(cgl.currentTextureEffect.getWidth() / cgl.currentTextureEffect.getHeight());
    else uniAspect.setValue(1);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexOffsetZ.get()) cgl.setTexture(1, inTexOffsetZ.get().tex);
    if (inTexMask.get()) cgl.setTexture(2, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
