const cgl = op.patch.cgl;

// inputs
const
    inTrigger = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inFloatSlider("Amount", 1),
    inLayerMode = op.inValueSelect("mode", [
        "exponential",
        "logarithmic",
        "linear"
    ], "exponential"),
    inRGBA = op.inValueBool("RGBA"),
    inScale = op.inValue("scale", 4),
    inNumLayers = op.inValueInt("layers", 3),
    inFactor = op.inFloat("factor", 1),
    inExponent = op.inFloat("exponent", 2),
    inScrollX = op.inFloat("scrollX"),
    inScrollY = op.inFloat("scrollY"),
    inScrollZ = op.inFloat("scrollZ");

// outputs
const outTrigger = op.outTrigger("trigger");

// locals
const TEX_SLOT = 0;
const shader = new CGL.Shader(cgl, "layernoise");
const attribs = [inScale.get(), inNumLayers.get(), inFactor.get(), 0];
shader.setSource(shader.getDefaultVertexShader(), attachments.layernoise_frag);
const attributes = new CGL.Uniform(shader, "4f", "attribs", attribs);

const uniMode = new CGL.Uniform(shader, "i", "mode", 2);
shader._addUniform(uniMode);
const uniRGBA = new CGL.Uniform(shader, "b", "rgba", false);
const scroll = [inScrollX.get(), inScrollY.get(), inScrollZ.get()];
const uniScroll = new CGL.Uniform(shader, "3f", "scroll", scroll);
const uniformAmount = new CGL.Uniform(shader, "f", "amount", amount);
const textureUniform = new CGL.Uniform(shader, "t", "tex", TEX_SLOT);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

let needsUpdate = false;
// events

inTrigger.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    if (needsUpdate)
    {
        attribs[0] = inScale.get();
        attribs[1] = inNumLayers.get();

        const layerMode = inLayerMode.get();
        if (layerMode == "linear")
            uniMode.set(0);
        else if (layerMode == "exponential")
            uniMode.set(1);
        else
            uniMode.set(2);

        attribs[2] = inFactor.get();
        attribs[3] = inExponent.get();
        attributes.set(attribs);

        uniRGBA.set(inRGBA.get());
        scroll[0] = inScrollX.get();
        scroll[1] = inScrollY.get();
        scroll[2] = inScrollZ.get();
        uniScroll.set(scroll);

        needsUpdate = false;
    }

    cgl.setTexture(TEX_SLOT, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();
    cgl.currentTextureEffect.finish();
    cgl.popShader();
    outTrigger.trigger();
};

const tile = op.inValueBool("Tileable", false);
tile.onChange = updateTileable;
function updateTileable()
{
    if (tile.get())shader.define("DO_TILEABLE");
    else shader.removeDefine("DO_TILEABLE");
}

inScale.onChange =
inNumLayers.onChange =
inLayerMode.onChange =
inExponent.onChange =
inFactor.onChange =
inRGBA.onChange =
inScrollX.onChange =
inScrollY.onChange =
inScrollZ.onChange = update;
function update()
{
    needsUpdate = true;
}

update();
