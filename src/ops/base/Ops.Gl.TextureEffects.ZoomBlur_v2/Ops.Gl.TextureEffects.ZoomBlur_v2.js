const
    render = op.inTrigger("render"),
    strength = op.inValueSlider("Strength", 0.5),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),

    mask = op.inTexture("mask"),
    // maskSource = op.inSwitch("Mask Source", ["Lumi", "R", "G", "B", "A"], "Lumi"),
    // maskInv = op.inBool("Mask Invert", false),

    trigger = op.outTrigger("trigger");

// op.setPortGroup("Mask", [mask, maskSource, maskInv]);
mask.onChange = function ()
{
    shader.toggleDefine("HAS_MASK", mask.get() && mask.get().tex);
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
