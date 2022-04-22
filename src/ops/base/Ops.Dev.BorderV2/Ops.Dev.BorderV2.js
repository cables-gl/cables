const
    render = op.inTrigger("render"),
    width = op.inValue("width", 0.1),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),

    amount = op.inValueSlider("Amount", 1),
    trigger = op.outTrigger("trigger"),
    smooth = op.inValueBool("Smooth", false),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    sideA = op.inFloat("Side A", 1),
    sideB = op.inFloat("Side B", 1),
    sideC = op.inFloat("Side C", 1),
    sideD = op.inFloat("Side D", 1);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "border");

shader.setSource(shader.getDefaultVertexShader(), attachments.border_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    aspectUniform = new CGL.Uniform(shader, "f", "aspect", 0),
    uniSmooth = new CGL.Uniform(shader, "b", "smoothed", smooth),
    uniWidth = new CGL.Uniform(shader, "f", "width", width.get()),
    unir = new CGL.Uniform(shader, "f", "r", r),
    unig = new CGL.Uniform(shader, "f", "g", g),
    unib = new CGL.Uniform(shader, "f", "b", b);

width.onChange = function ()
{
    uniWidth.setValue(width.get() / 2);
};

r.setUiAttribs({ "colorPick": true });
shader.addUniformFrag("4f", "mulSides", sideA, sideB, sideC, sideD);

op.setPortGroup("Sides", [sideA, sideB, sideC, sideD]);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();
    aspectUniform.set(texture.height / texture.width);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
