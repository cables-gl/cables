const
    render = op.inTrigger("render"),
    strength = op.inValueSlider("Strength", 0.5),
    inNumSamples = op.inInt("Samples", 40),
    x = op.inValue("X", 0),
    y = op.inValue("Y", 0),
    inMaskTex = op.inTexture("Strength Map"),
    inMaskSource = op.inSwitch("Source Strength Map", ["R", "G", "B", "A", "Lum"], "R"),
    inMaskInv = op.inBool("Invert Strength Map", false),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Strengh Map", [inMaskTex, inMaskSource, inMaskInv]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "zoomblur");

shader.setSource(shader.getDefaultVertexShader(), attachments.zoomblur_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureMask = new CGL.Uniform(shader, "t", "texMask", 1),
    uniX = new CGL.Uniform(shader, "f", "x", x),
    uniY = new CGL.Uniform(shader, "f", "y", y),
    strengthUniform = new CGL.Uniform(shader, "f", "strength", strength);

inNumSamples.onChange =
inMaskSource.onChange =
    inMaskInv.onChange =
    inMaskTex.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("HAS_MASK", inMaskTex.isLinked());

    shader.toggleDefine("MASK_SRC_R", inMaskSource.get() == "R");
    shader.toggleDefine("MASK_SRC_G", inMaskSource.get() == "G");
    shader.toggleDefine("MASK_SRC_B", inMaskSource.get() == "B");
    shader.toggleDefine("MASK_SRC_A", inMaskSource.get() == "A");
    shader.toggleDefine("MASK_SRC_LUM", inMaskSource.get() == "Lum");

    shader.toggleDefine("MASK_INV", inMaskInv.get());

    shader.define("NUM_SAMPLES", inNumSamples.get() + ".0");

    inMaskSource.setUiAttribs({ "greyout": !inMaskTex.isLinked() });
    inMaskInv.setUiAttribs({ "greyout": !inMaskTex.isLinked() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    if (strength.get() > 0)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

        if (inMaskTex.get() && inMaskTex.get().tex) cgl.setTexture(1, inMaskTex.get().tex);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }
    trigger.trigger();
};
