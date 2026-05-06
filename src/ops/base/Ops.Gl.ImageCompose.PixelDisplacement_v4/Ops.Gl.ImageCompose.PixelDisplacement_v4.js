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
    inMultisample = op.inValueBool("MSAA", false),
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
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniPSize = new CGL.Uniform(shader, "2f", "psize", 0,0);

inMapping.onChange =
inZero.onChange =
inWrap.onChange =
inMultisample.onChange =
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

    shader.toggleDefine("USE_MSAA", inMultisample.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    if (displaceTex.get())
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();
        
        let w = cgl.currentTextureEffect.getCurrentSourceTexture().width;
        let h = cgl.currentTextureEffect.getCurrentSourceTexture().height;
        
        repeatUni.setValue([
            w / displaceTex.get().width,
            h / displaceTex.get().height]);

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
        if (displaceTex.get()) cgl.setTexture(1, displaceTex.get().tex);
        if (inMultisample.get()) uniPSize.setValue([(1.0/w)*(1.0/16.0),(1.0/h)*(1.0/16.0)]);

        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};
