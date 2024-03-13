const render = op.inTrigger("render"),
    amount = op.inValueSlider("Amount", 1),
    blendMode = CGL.TextureEffect.AddBlendSelect(op),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    inCoordMode = op.inSwitch("Coordinates", ["0-1", "-1-1", "Pixel"], "0-1"),
    inCenterMode = op.inBool("Center", false),
    inPosX = op.inFloat("X", 0),
    inPosY = op.inFloat("Y", 0),
    inWidth = op.inFloat("Width", 0.25),
    inHeight = op.inFloat("Height", 0.25),
    inRot = op.inValue("Rotate", 0),
    inRoundness = op.inValueSlider("roundness", 0),
    r = op.inValueSlider("r", 1.0),
    g = op.inValueSlider("g", 1.0),
    b = op.inValueSlider("b", 1.0),
    a = op.inValueSlider("a", 1.0),
    inTexMap = op.inTexture("Texture"),
    inTexMask = op.inTexture("Mask"),

    trigger = op.outTrigger("trigger");

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Size", [inWidth, inHeight]);
op.setPortGroup("Position", [inPosX, inPosY, inCoordMode, inCenterMode]);
op.setPortGroup("Color", [r, g, b, a]);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, "textureeffect rectangle");
shader.setSource(shader.getDefaultVertexShader(), attachments.rectangle_frag || "");

let
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniTexMap = new CGL.Uniform(shader, "t", "texMap", 1),
    uniTexMask = new CGL.Uniform(shader, "t", "texMask", 2),
    uniHeight = new CGL.Uniform(shader, "f", "height", 0.5),
    unWidth = new CGL.Uniform(shader, "f", "width", 0.5),
    uniX = new CGL.Uniform(shader, "f", "x", 0),
    uniY = new CGL.Uniform(shader, "f", "y", 0),
    uniRot = new CGL.Uniform(shader, "f", "rotate", inRot),
    uniRoundness = new CGL.Uniform(shader, "f", "roundness", inRoundness),
    uniformR = new CGL.Uniform(shader, "f", "r", r),
    uniformG = new CGL.Uniform(shader, "f", "g", g),
    uniformB = new CGL.Uniform(shader, "f", "b", b),
    uniformA = new CGL.Uniform(shader, "f", "a", a),
    uniformAmount = new CGL.Uniform(shader, "f", "amount", amount),
    uniformAspect = new CGL.Uniform(shader, "f", "aspect", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

inTexMask.onLinkChanged =
inTexMap.onLinkChanged =
    inCenterMode.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("CENTER", inCenterMode.get());
    shader.toggleDefine("HAS_TEXMAP", inTexMap.isLinked());
    shader.toggleDefine("HAS_TEXMASK", inTexMask.isLinked());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    let x = inPosX.get();
    let y = inPosY.get();
    let w = inWidth.get();
    let h = inHeight.get();

    if (inCoordMode.get() == "-1-1")
    {
        x = (x / 2 + 0.5);
        y = (y / 2 + 0.5);
        w /= 2;
        h /= 2;
    }
    if (inCoordMode.get() == "Pixel")
    {
        x /= cgl.currentTextureEffect.getWidth();
        y /= cgl.currentTextureEffect.getHeight();
        w /= cgl.currentTextureEffect.getWidth();
        h /= cgl.currentTextureEffect.getHeight();
    }

    uniX.set(x);
    uniY.set(y);
    unWidth.set(w);
    uniHeight.set(h);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    const texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    cgl.setTexture(0, texture.tex);
    if (inTexMap.get()) cgl.setTexture(1, inTexMap.get().tex);
    if (inTexMask.get()) cgl.setTexture(2, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
