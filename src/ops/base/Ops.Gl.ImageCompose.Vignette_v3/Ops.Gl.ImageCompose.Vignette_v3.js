const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    trigger = op.outTrigger("Trigger"),
    strength = op.inValueSlider("Strength", 1),
    lensRadius1 = op.inValueSlider("Radius", 0.3),
    sharp = op.inValueSlider("Sharp", 0.25),
    aspect = op.inValue("Aspect", 1),
    r = op.inValueSlider("r", 0),
    g = op.inValueSlider("g", 0),
    b = op.inValueSlider("b", 0),
    alpha = op.inBool("Alpha", false);

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "vignette");

shader.setSource(shader.getDefaultVertexShader(), attachments.vignette_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniLensRadius1 = new CGL.Uniform(shader, "f", "lensRadius1", lensRadius1),
    uniaspect = new CGL.Uniform(shader, "f", "aspect", aspect),
    unistrength = new CGL.Uniform(shader, "f", "strength", strength),
    unisharp = new CGL.Uniform(shader, "f", "sharp", sharp),
    unir = new CGL.Uniform(shader, "3f", "vcol", r, g, b);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

alpha.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("ALPHA", alpha.get());

    r.setUiAttribs({ "greyout": alpha.get() });
    g.setUiAttribs({ "greyout": alpha.get() });
    b.setUiAttribs({ "greyout": alpha.get() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
