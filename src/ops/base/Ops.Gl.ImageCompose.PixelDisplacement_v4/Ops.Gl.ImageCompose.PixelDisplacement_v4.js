const
    render = op.inTrigger("render"),
    displaceTex = op.inTexture("displaceTex"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    amountX = op.inValueSlider("amount X", 0.2),
    amountY = op.inValueSlider("amount Y", 0.2),
    inWrap = op.inSwitch("Wrap", ["Mirror", "Clamp", "Repeat"], "Mirror"),
    inInput = op.inValueSelect("Input", ["Luminance", "RedGreen", "Red", "Green", "Blue"], "Luminance"),
    inZero = op.inSwitch("Zero Displace", ["Grey", "Black"], "Grey"),
    inMapping = op.inSwitch("Pixel Mapping", ["Stretch", "Repeat"], "Stretch"),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Axis Displacement Strength", [amountX, amountY]);
op.setPortGroup("Modes", [inWrap, inInput]);
op.toWorkPortsNeedToBeLinked(displaceTex);

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.pixeldisplace3_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureDisplaceUniform = new CGL.Uniform(shader, "t", "displaceTex", 1),
    amountXUniform = new CGL.Uniform(shader, "f", "amountX", amountX),
    amountYUniform = new CGL.Uniform(shader, "f", "amountY", amountY),
    repeatUni = new CGL.Uniform(shader, "2f", "repeat", 1, 1),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

inMapping.onChange =
inZero.onChange =
inWrap.onChange =
inInput.onChange = updateDefines;

updateDefines();

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

function updateDefines()
{
    shader.toggleDefine("MAPPING_REPEAT", inMapping.get() == "Repeat");

    shader.removeDefine("ZERO_BLACK");
    shader.removeDefine("ZERO_GREY");
    shader.define("ZERO_" + (inZero.get() + "").toUpperCase());

    shader.removeDefine("WRAP_CLAMP");
    shader.removeDefine("WRAP_REPEAT");
    shader.removeDefine("WRAP_MIRROR");
    shader.define("WRAP_" + (inWrap.get() + "").toUpperCase());

    shader.removeDefine("INPUT_LUMINANCE");
    shader.removeDefine("INPUT_REDGREEN");
    shader.removeDefine("INPUT_RED");
    shader.define("INPUT_" + (inInput.get() + "").toUpperCase());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    if (displaceTex.get())
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        repeatUni.setValue([
            cgl.currentTextureEffect.getCurrentSourceTexture().width / displaceTex.get().width,
            cgl.currentTextureEffect.getCurrentSourceTexture().height / displaceTex.get().height]);

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
        if (displaceTex.get()) cgl.setTexture(1, displaceTex.get().tex);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
