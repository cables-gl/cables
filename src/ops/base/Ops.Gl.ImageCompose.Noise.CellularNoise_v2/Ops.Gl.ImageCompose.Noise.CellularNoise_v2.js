const
    render = op.inTrigger("render"),
    inTexMask = op.inTexture("Mask"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),

    amount = op.inValueSlider("Amount", 1),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    z = op.inValue("Z", 0),
    scale = op.inValue("Scale", 5),

    inHarmonics = op.inSwitch("Harmonics", ["1", "2", "3", "4", "5"], "1"),
    tile = op.inValueBool("Tileable", false),

    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.cellularnoise3d_frag);

const textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniOffset = new CGL.Uniform(shader, "t", "texOffsetZ", 1),
    uniMask = new CGL.Uniform(shader, "t", "texMask", 2),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniZ = new CGL.Uniform(shader, "f", "z", z),
    uniX = new CGL.Uniform(shader, "f", "x", x),
    uniY = new CGL.Uniform(shader, "f", "y", y),
    uniScale = new CGL.Uniform(shader, "f", "scale", scale);

tile.onChange = updateTileable;
function updateTileable()
{
    if (tile.get())shader.define("DO_TILEABLE");
    else shader.removeDefine("DO_TILEABLE");
}

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

// offsetMap

const
    inTexOffsetTex = op.inTexture("Offset"),
    inOffsetMul = op.inFloat("Offset Multiply", 1),

    offsetX = op.inSwitch("Offset X", ["None", "R", "G", "B"], "None"),
    offsetY = op.inSwitch("Offset Y", ["None", "R", "G", "B"], "None"),
    offsetZ = op.inSwitch("Offset Z", ["None", "R", "G", "B"], "R");

const uniOffMul = new CGL.Uniform(shader, "f", "offMul", inOffsetMul);

op.setPortGroup("Offset Map", [inTexOffsetTex, offsetZ, offsetY, offsetX, inOffsetMul]);

const uniAspect = new CGL.Uniform(shader, "f", "aspect", 1);
const uniHarmonics = new CGL.Uniform(shader, "f", "harmonics", 0);
inHarmonics.onChange = () =>
{
    uniHarmonics.setValue(parseFloat(inHarmonics.get()));
};

offsetX.onChange =
offsetY.onChange =
offsetZ.onChange =
inTexMask.onChange =
inTexOffsetTex.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("HAS_TEX_OFFSETMAP", inTexOffsetTex.get());
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

    offsetX.setUiAttribs({ "greyout": !inTexOffsetTex.isLinked() });
    offsetY.setUiAttribs({ "greyout": !inTexOffsetTex.isLinked() });
    offsetZ.setUiAttribs({ "greyout": !inTexOffsetTex.isLinked() });
}

// end offsetmap

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexOffsetTex.get()) cgl.setTexture(1, inTexOffsetTex.get().tex);
    if (inTexMask.get()) cgl.setTexture(2, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
