const
    render = op.inTrigger("render"),
    strength = op.inValueSlider("Strength", 0.5),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),

    mask = op.inTexture("Strength Map"),
    maskSource = op.inSwitch("Source Strength Map", ["R", "G", "B", "A", "Lum"], "R"),
    maskInv = op.inBool("Invert Strength Map", false),

    trigger = op.outTrigger("trigger");

op.setPortGroup("Strengh Map", [mask, maskSource, maskInv]);

maskSource.onChange =
maskInv.onChange =
mask.onChange = function ()
{
    shader.toggleDefine("HAS_MASK", mask.get() && mask.get().tex);

    shader.toggleDefine("MASK_SRC_R", maskSource.get() == "R");
    shader.toggleDefine("MASK_SRC_G", maskSource.get() == "G");
    shader.toggleDefine("MASK_SRC_B", maskSource.get() == "B");
    shader.toggleDefine("MASK_SRC_A", maskSource.get() == "A");
    shader.toggleDefine("MASK_SRC_LUM", maskSource.get() == "LUM");

    shader.toggleDefine("MASK_INV", maskInv.get());

    maskSource.setUiAttribs({ "greyout": !mask.isLinked() });
    maskInv.setUiAttribs({ "greyout": !mask.isLinked() });
};

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "zoomblur");

shader.setSource(shader.getDefaultVertexShader(), attachments.zoomblur_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMask = new CGL.Uniform(shader, "t", "texMask", 1),
    uniX = new CGL.Uniform(shader, "f", "x", x),
    uniY = new CGL.Uniform(shader, "f", "y", y),
    strengthUniform = new CGL.Uniform(shader, "f", "strength", strength);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    if (strength.get() > 0)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

        if (mask.get() && mask.get().tex) cgl.setTexture(1, mask.get().tex);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }
    trigger.trigger();
};
