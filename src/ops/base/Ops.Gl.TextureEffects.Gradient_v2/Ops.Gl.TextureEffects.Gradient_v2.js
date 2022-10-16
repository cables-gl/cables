const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    width = op.inValue("Width", 1),
    gType = op.inSwitch("Type", ["X", "Y", "XY", "Radial"], "X"),
    pos1 = op.inValueSlider("Pos", 0.5),
    smoothStep = op.inValueBool("Smoothstep", true),
    inSrgb = op.inValueBool("sRGB", false),
    inColSpace = op.inSwitch("color space", ["RGB", "Oklab", "OklabG"], "RGB"),

    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),

    r2 = op.inValueSlider("r2", Math.random()),
    g2 = op.inValueSlider("g2", Math.random()),
    b2 = op.inValueSlider("b2", Math.random()),

    r3 = op.inValueSlider("r3", Math.random()),
    g3 = op.inValueSlider("g3", Math.random()),
    b3 = op.inValueSlider("b3", Math.random()),

    randomize = op.inTriggerButton("Randomize"),
    next = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });
r2.setUiAttribs({ "colorPick": true });
r3.setUiAttribs({ "colorPick": true });

op.setPortGroup("Blending", [blendMode, amount]);
op.setPortGroup("Color A", [r, g, b]);
op.setPortGroup("Color B", [r2, g2, b2]);
op.setPortGroup("Color C", [r3, g3, b3]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "gradient");

shader.setSource(shader.getDefaultVertexShader(), attachments.gradient_frag);
const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
const uniPos = new CGL.Uniform(shader, "f", "pos", pos1);
const uniWidth = new CGL.Uniform(shader, "f", "width", width);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let r3uniform, r2uniform, runiform;

r2.onChange = g2.onChange = b2.onChange = updateCol2;
r3.onChange = g3.onChange = b3.onChange = updateCol3;
r.onChange = g.onChange = b.onChange = updateCol;

r2.onLinkChanged = g2.onLinkChanged = b2.onLinkChanged =
r3.onLinkChanged = g3.onLinkChanged = b3.onLinkChanged =
r.onLinkChanged = g.onLinkChanged = b.onLinkChanged = updateUi;

updateCol();
updateCol2();
updateCol3();
updateDefines();

inSrgb.onChange =
inColSpace.onChange =
smoothStep.onChange =
    gType.onChange = updateDefines;

function updateUi()
{
    randomize.setUiAttribs({ "greyout": r2.isLinked() || g2.isLinked() || b2.isLinked() || r3.isLinked() || g3.isLinked() || b3.isLinked() || r.isLinked() || g.isLinked() || b.isLinked() });
}

function updateDefines()
{
    // shader.toggleDefine("OKLABGAIN", inoklabGain.get());
    shader.toggleDefine("SRGB", inSrgb.get());

    shader.define("MIXER", (inColSpace.get() + "").indexOf("Oklab") > -1 ? "oklab_mix" : "mix");
    shader.toggleDefine("OKLABGAIN", (inColSpace.get() + "").indexOf("OklabG") > -1);

    shader.toggleDefine("GRAD_SMOOTHSTEP", smoothStep.get());
    shader.toggleDefine("GRAD_X", gType.get() == "X");
    shader.toggleDefine("GRAD_XY", gType.get() == "XY");
    shader.toggleDefine("GRAD_Y", gType.get() == "Y");
    shader.toggleDefine("GRAD_RADIAL", gType.get() == "Radial");
}

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

randomize.onTriggered = function ()
{
    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());

    r2.set(Math.random());
    g2.set(Math.random());
    b2.set(Math.random());

    r3.set(Math.random());
    g3.set(Math.random());
    b3.set(Math.random());

    op.refreshParams();
};

function updateCol()
{
    const colA = [r.get(), g.get(), b.get()];
    if (!runiform) runiform = new CGL.Uniform(shader, "3f", "colA", colA);
    else runiform.setValue(colA);
}

function updateCol2()
{
    const colB = [r2.get(), g2.get(), b2.get()];
    if (!r2uniform) r2uniform = new CGL.Uniform(shader, "3f", "colB", colB);
    else r2uniform.setValue(colB);
}

function updateCol3()
{
    const colC = [r3.get(), g3.get(), b3.get()];
    if (!r3uniform) r3uniform = new CGL.Uniform(shader, "3f", "colC", colC);
    else r3uniform.setValue(colC);
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    cgl.currentTextureEffect.finish();
    cgl.popShader();

    next.trigger();
};
