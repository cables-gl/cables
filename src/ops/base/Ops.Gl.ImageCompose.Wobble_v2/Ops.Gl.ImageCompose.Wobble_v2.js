const
    render = op.inTrigger("Render"),
    time = op.inValue("time", 0),
    speedX = op.inValue("SpeedX", 4),
    speedY = op.inValue("SpeedY", 8),

    repeatX = op.inValue("RepeatX", 11),
    repeatY = op.inValue("RepeatY", 11),
    mul = op.inValue("Multiply", 0.01),

    inMaskTex = op.inTexture("Amount Map"),
    inMaskSource = op.inSwitch("Source Amount Map", ["R", "G", "B", "A", "Lum"], "R"),
    inMaskInv = op.inBool("Invert Amount Map", false),

    trigger = op.outTrigger("Trigger");

op.setPortGroup("Amount Map", [inMaskTex, inMaskSource, inMaskInv]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.wobble_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    timeUniform = new CGL.Uniform(shader, "f", "time", time),
    speedXUniform = new CGL.Uniform(shader, "f", "speedX", speedX),
    speedYUniform = new CGL.Uniform(shader, "f", "speedY", speedY),
    repeatXUniform = new CGL.Uniform(shader, "f", "repeatX", repeatX),
    repeatYUniform = new CGL.Uniform(shader, "f", "repeatY", repeatY),
    mulUniform = new CGL.Uniform(shader, "f", "mul", mul),
    maskUniform = new CGL.Uniform(shader, "t", "texMask", 1);

inMaskTex.onChange =
inMaskSource.onChange =
inMaskInv.onChange = () =>
{
    shader.toggleDefine("HAS_MASK", inMaskTex.isLinked());
    shader.toggleDefine("MASK_SRC_R", inMaskSource.get() == "R");
    shader.toggleDefine("MASK_SRC_G", inMaskSource.get() == "G");
    shader.toggleDefine("MASK_SRC_B", inMaskSource.get() == "B");
    shader.toggleDefine("MASK_SRC_A", inMaskSource.get() == "A");
    shader.toggleDefine("MASK_SRC_LUM", inMaskSource.get() == "Lum");
    shader.toggleDefine("MASK_INV", inMaskInv.get());
    inMaskSource.setUiAttribs({ "greyout": !inMaskTex.isLinked() });
    inMaskInv.setUiAttribs({ "greyout": !inMaskTex.isLinked() });
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inMaskTex.get()) cgl.setTexture(1, inMaskTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
