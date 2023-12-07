const
    render = op.inTrigger("Render"),
    amount = op.inValueSlider("Amount", 1),
    blendMode = CGL.TextureEffect.AddBlendSelect(op),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    inSize = op.inValueSlider("Size", 0.25),
    inInner = op.inValueSlider("Inner"),
    inStretchX = op.inFloat("Stretch X"),
    inStretchY = op.inFloat("Stretch Y"),
    inX = op.inValue("Pos X", 0),
    inY = op.inValue("Pos Y", 0),
    fallOff = op.inValueSelect("fallOff", ["Linear", "SmoothStep"], "Linear"),
    inFadeOut = op.inValueSlider("fade Out"),
    warnOverflow = op.inValueBool("warn overflow", false),
    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    a = op.inValueSlider("a", 1),
    trigger = op.outTrigger("Next");

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Size", [inSize, inInner, inStretchX, inStretchY]);
op.setPortGroup("Position", [inX, inY]);
op.setPortGroup("Style", [warnOverflow, fallOff, inFadeOut]);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, "textureeffect stripes");
shader.setSource(shader.getDefaultVertexShader(), attachments.circle_frag);

updateDefines();

let
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniStretch = new CGL.Uniform(shader, "2f", "stretch", inStretchX, inStretchY),
    uniSize = new CGL.Uniform(shader, "f", "size", inSize),
    uniFadeOut = new CGL.Uniform(shader, "f", "fadeOut", inFadeOut),
    uniInner = new CGL.Uniform(shader, "f", "inner", inInner),
    aspect = new CGL.Uniform(shader, "f", "aspect", 1),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b),
    uniformA = new CGL.Uniform(shader, "f", "a", a),
    uniformX = new CGL.Uniform(shader, "f", "x", inX),
    uniformY = new CGL.Uniform(shader, "f", "y", inY);

fallOff.onChange =
    warnOverflow.onChange = updateDefines;

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

function updateDefines()
{
    shader.toggleDefine("FALLOFF_LINEAR", fallOff.get() == "Linear");
    shader.toggleDefine("FALLOFF_SMOOTHSTEP", fallOff.get() == "SmoothStep");
    shader.toggleDefine("WARN_OVERFLOW", warnOverflow.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    aspect.set(cgl.currentTextureEffect.aspectRatio);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
