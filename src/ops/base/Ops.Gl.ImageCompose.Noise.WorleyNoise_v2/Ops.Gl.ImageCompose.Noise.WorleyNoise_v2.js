const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    z = op.inValue("Z", 0),
    scale = op.inValue("Scale", 6),
    inHarmonics = op.inSwitch("Harmonics", ["1", "2", "3", "4", "5"], "1"),
    inv = op.inValueBool("Invert", true),
    rangeA = op.inValueSlider("RangeA", 0.4),
    rangeB = op.inValueSlider("RangeB", 0.5),
    tile = op.inValueBool("Tileable", false),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.worleynoise_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureUniformOffZ = new CGL.Uniform(shader, "t", "texOffsetZ", 1),
    textureUniformMask = new CGL.Uniform(shader, "t", "texMask", 2),
    uniZ = new CGL.Uniform(shader, "f", "z", z),
    uniX = new CGL.Uniform(shader, "f", "x", x),
    uniY = new CGL.Uniform(shader, "f", "y", y),
    uniScale = new CGL.Uniform(shader, "f", "scale", scale),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1),
    uniharmonics = new CGL.Uniform(shader, "f", "harmonics", inHarmonics),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    rangeAUniform = new CGL.Uniform(shader, "f", "rangeA", rangeA),
    rangeBUniform = new CGL.Uniform(shader, "f", "rangeB", rangeB);

// amount Map

const
    inMaskTex = op.inTexture("Amount Map"),
    inMaskSource = op.inSwitch("Source Strength Map", ["R", "G", "B", "A", "Lum"], "R"),
    inMaskInv = op.inBool("Invert Strength Map", false);

inMaskSource.setUiAttribs({ "title": "Source Amount Map" });
inMaskInv.setUiAttribs({ "title": "Invert Amount Map" });

op.setPortGroup("Amount Map", [inMaskTex, inMaskSource, inMaskInv]);

// offsetMap

const
    inTexOffsetZ = op.inTexture("Offset"),
    inOffsetMul = op.inFloat("Offset Multiply", 1),
    offsetX = op.inSwitch("Offset X", ["None", "R", "G", "B"], "None"),
    offsetY = op.inSwitch("Offset Y", ["None", "R", "G", "B"], "None"),
    offsetZ = op.inSwitch("Offset Z", ["None", "R", "G", "B"], "R");

op.setPortGroup("Offset Map", [inTexOffsetZ, offsetZ, offsetY, offsetX, inOffsetMul]);

const uniOffMul = new CGL.Uniform(shader, "f", "offMul", inOffsetMul);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

inMaskTex.onChange =
    inMaskSource.onChange =
    inMaskInv.onChange =
    inv.onChange =
    offsetX.onChange =
    offsetY.onChange =
    offsetZ.onChange =
    inMaskTex.onLinkChanged =
    inTexOffsetZ.onLinkChanged =
    tile.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("DO_INVERT", inv.get());
    shader.toggleDefine("DO_TILEABLE", tile.get());

    shader.toggleDefine("HAS_TEX_OFFSETMAP", inTexOffsetZ.isLinked());
    shader.toggleDefine("HAS_TEX_MASK", inMaskTex.isLinked());

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

    shader.toggleDefine("HAS_MASK", inMaskTex.isLinked());
    shader.toggleDefine("MASK_SRC_R", inMaskSource.get() == "R");
    shader.toggleDefine("MASK_SRC_G", inMaskSource.get() == "G");
    shader.toggleDefine("MASK_SRC_B", inMaskSource.get() == "B");
    shader.toggleDefine("MASK_SRC_A", inMaskSource.get() == "A");
    shader.toggleDefine("MASK_SRC_LUM", inMaskSource.get() == "Lum");
    shader.toggleDefine("MASK_INV", inMaskInv.get());
    inMaskSource.setUiAttribs({ "greyout": !inMaskTex.isLinked() });
    inMaskInv.setUiAttribs({ "greyout": !inMaskTex.isLinked() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexOffsetZ.get()) cgl.setTexture(1, inTexOffsetZ.get().tex);
    if (inMaskTex.get()) cgl.setTexture(2, inMaskTex.get().tex);

    uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
