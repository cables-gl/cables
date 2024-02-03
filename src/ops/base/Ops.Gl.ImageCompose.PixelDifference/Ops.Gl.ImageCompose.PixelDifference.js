const options = [
    "Vertical Difference Red", "Vertical Difference Green", "Vertical Difference Blue",
    "Vertical Average Red", "Vertical Average Green", "Vertical Average Blue",
    "Vertical Luminance",
    "Horizontal Difference Red", "Horizontal Difference Green", "Horizontal Difference Blue",
    "Horizontal Average Red", "Horizontal Average Green", "Horizontal Average Blue",
    "Horizontal Luminance",
    "Midpoint", "Zero", "One"
];

const
    render = op.inTrigger("render"),
    strength = op.inValue("Strength", 4),
    step = op.inValue("Step", 1),
    rMeth = op.inDropDown("Red", options, "Horizontal Difference Red"),
    rFlip = op.inBool("Red Flip", false),
    gMeth = op.inDropDown("Green", options, "Vertical Difference Green"),
    gFlip = op.inBool("Green Flip", false),
    bMeth = op.inDropDown("Blue", options, "Midpoint"),
    bFlip = op.inBool("Blue Flip", false),
    trigger = op.outTrigger("trigger");
op.setPortGroup("Method", [rFlip, gFlip, bFlip, rMeth, gMeth, bMeth]);

rFlip.onChange =
gFlip.onChange =
bFlip.onChange =
rMeth.onChange =
    gMeth.onChange =
    bMeth.onChange = updateDefines;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.slope_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniStrength = new CGL.Uniform(shader, "f", "strength", strength),
    uniStep = new CGL.Uniform(shader, "f", "sstep", step),
    uniRes = new CGL.Uniform(shader, "2f", "pixel");

updateDefines();

function updateDefines()
{
    shader.toggleDefine("DIR_R_HORIZONTAL", (rMeth.get() + "").indexOf("Horizontal") != -1);
    shader.toggleDefine("DIR_G_HORIZONTAL", (gMeth.get() + "").indexOf("Horizontal") != -1);
    shader.toggleDefine("DIR_B_HORIZONTAL", (bMeth.get() + "").indexOf("Horizontal") != -1);

    shader.toggleDefine("METH_R_DIFF", (rMeth.get() + "").indexOf("Difference") != -1);
    shader.toggleDefine("METH_G_DIFF", (gMeth.get() + "").indexOf("Difference") != -1);
    shader.toggleDefine("METH_B_DIFF", (bMeth.get() + "").indexOf("Difference") != -1);

    shader.toggleDefine("METH_R_AVG", (rMeth.get() + "").indexOf("Average") != -1);
    shader.toggleDefine("METH_G_AVG", (gMeth.get() + "").indexOf("Average") != -1);
    shader.toggleDefine("METH_B_AVG", (bMeth.get() + "").indexOf("Average") != -1);

    shader.toggleDefine("METH_R_R", (rMeth.get() + "").indexOf("Red") != -1);
    shader.toggleDefine("METH_G_R", (gMeth.get() + "").indexOf("Red") != -1);
    shader.toggleDefine("METH_B_R", (bMeth.get() + "").indexOf("Red") != -1);

    shader.toggleDefine("METH_R_G", (rMeth.get() + "").indexOf("Green") != -1);
    shader.toggleDefine("METH_G_G", (gMeth.get() + "").indexOf("Green") != -1);
    shader.toggleDefine("METH_B_G", (bMeth.get() + "").indexOf("Green") != -1);

    shader.toggleDefine("METH_R_B", (rMeth.get() + "").indexOf("Blue") != -1);
    shader.toggleDefine("METH_G_B", (gMeth.get() + "").indexOf("Blue") != -1);
    shader.toggleDefine("METH_B_B", (bMeth.get() + "").indexOf("Blue") != -1);

    shader.toggleDefine("METH_R_LUMI", (rMeth.get() + "").indexOf("Luminance") != -1);
    shader.toggleDefine("METH_G_LUMI", (gMeth.get() + "").indexOf("Luminance") != -1);
    shader.toggleDefine("METH_B_LUMI", (bMeth.get() + "").indexOf("Luminance") != -1);

    shader.toggleDefine("METH_R_MID", (rMeth.get() + "").indexOf("Midpoint") != -1);
    shader.toggleDefine("METH_G_MID", (gMeth.get() + "").indexOf("Midpoint") != -1);
    shader.toggleDefine("METH_B_MID", (bMeth.get() + "").indexOf("Midpoint") != -1);

    shader.toggleDefine("METH_R_ZERO", (rMeth.get() + "").indexOf("Zero") != -1);
    shader.toggleDefine("METH_G_ZERO", (gMeth.get() + "").indexOf("Zero") != -1);
    shader.toggleDefine("METH_B_ZERO", (bMeth.get() + "").indexOf("Zero") != -1);

    shader.toggleDefine("METH_R_ONE", (rMeth.get() + "").indexOf("One") != -1);
    shader.toggleDefine("METH_G_ONE", (gMeth.get() + "").indexOf("One") != -1);
    shader.toggleDefine("METH_B_ONE", (bMeth.get() + "").indexOf("One") != -1);

    shader.toggleDefine("FLIP_R", rFlip.get());
    shader.toggleDefine("FLIP_G", gFlip.get());
    shader.toggleDefine("FLIP_B", bFlip.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    const tex = cgl.currentTextureEffect.getCurrentSourceTexture();
    uniRes.set([1 / tex.width, 1 / tex.height]);

    cgl.setTexture(0, tex.tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
