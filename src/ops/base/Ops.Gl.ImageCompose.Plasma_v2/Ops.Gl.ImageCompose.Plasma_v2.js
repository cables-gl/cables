const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    w = op.inValue("Width", 20),
    h = op.inValue("Height", 20),
    inAspect = op.inBool("Aspect", true),
    mul = op.inValue("Mul", 1),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    time = op.inValue("Time", 1),
    greyscale = op.inValueBool("Greyscale", true),

    inTexOffsetZ = op.inTexture("Offset"),
    inOffsetMul = op.inFloat("Offset Multiply", 1),
    offsetX = op.inSwitch("Offset X", ["None", "R", "G", "B"], "None"),
    offsetY = op.inSwitch("Offset Y", ["None", "R", "G", "B"], "None"),
    offsetZ = op.inSwitch("Offset Time", ["None", "R", "G", "B"], "R"),

    inTexMask = op.inTexture("Mask"),

    trigger = op.outTrigger("trigger");

op.setPortGroup("Offset Map", [inTexOffsetZ, offsetZ, offsetY, offsetX, inOffsetMul]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.plasma_frag);
CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

const
    uniPos = new CGL.Uniform(shader, "2f", "pos", x, y),
    uniSize = new CGL.Uniform(shader, "2f", "size", w, h),
    uniTime = new CGL.Uniform(shader, "f", "time", time),
    uniMul = new CGL.Uniform(shader, "f", "mul", mul),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1),
    uniOffMul = new CGL.Uniform(shader, "f", "offMul", inOffsetMul),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureUniformOffZ = new CGL.Uniform(shader, "t", "texOffsetZ", 1),
    textureUniformMask = new CGL.Uniform(shader, "t", "texMask", 2),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

offsetX.onChange =
    inAspect.onChange =
    offsetY.onChange =
    offsetZ.onChange =
    inTexMask.onChange =
    greyscale.onChange =
    inTexOffsetZ.onLinkChanged = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("GREY", greyscale.get());

    shader.toggleDefine("HAS_TEX_OFFSETMAP", inTexOffsetZ.isLinked());
    shader.toggleDefine("HAS_TEX_MASK", inTexMask.isLinked());

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

    h.setUiAttribs({ "greyout": inAspect.get() });
    shader.toggleDefine("FIXASPECT", inAspect.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    if (inAspect.get()) uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);
    else uniAspect.setValue(1);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexOffsetZ.get()) cgl.setTexture(1, inTexOffsetZ.get().tex);
    if (inTexMask.get()) cgl.setTexture(2, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
