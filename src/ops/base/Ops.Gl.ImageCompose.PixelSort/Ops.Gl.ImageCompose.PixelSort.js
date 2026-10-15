const
    render = op.inTrigger("render"),
    structure = op.inSwitch("Structure", ["Rows", "Columns"], "Rows"),
    invert = op.inBool("Invert", false),
    sort = op.inSwitch("Sort", ["Luminance", "R", "G", "B"], "Luminance"),

    trigger = op.outTrigger("trigger"),
    textureMask = op.inTexture("Mask"),
    textureGroup = op.inTexture("Group");

let frame = 0;
const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
shader.setSource(shader.getDefaultVertexShader(), attachments.scroll_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniFrame = new CGL.Uniform(shader, "f", "frame", 0),
    uniWidth = new CGL.Uniform(shader, "f", "width", 0),
    uniHeight = new CGL.Uniform(shader, "f", "height", 0),

    unitexMask = new CGL.Uniform(shader, "t", "texMask", 1),
    unitexGroup = new CGL.Uniform(shader, "t", "texGroup", 2);

textureMask.onLinkChanged =
    textureGroup.onLinkChanged =
    invert.onChange =
    structure.onChange =
    sort.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("SORT_LUM", sort.get() == "Luminance");
    shader.toggleDefine("SORT_R", sort.get() == "R");
    shader.toggleDefine("SORT_G", sort.get() == "G");
    shader.toggleDefine("SORT_B", sort.get() == "B");

    shader.toggleDefine("STR_ROWS", structure.get() == "Rows");
    shader.toggleDefine("STR_COLS", structure.get() == "Columns");
    shader.toggleDefine("INVERT", invert.get());

    shader.toggleDefine("MASK", textureMask.isLinked());
    shader.toggleDefine("GROUP", textureGroup.isLinked());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    uniFrame.setValue(frame);
    frame++;

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (textureMask.get()) cgl.setTexture(1, textureMask.get().tex);
    if (textureGroup.get()) cgl.setTexture(2, textureGroup.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
