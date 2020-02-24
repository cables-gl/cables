const cgl = op.patch.cgl;

// inputs
const inTrigger = op.inTrigger("render"),
    blendMode=CGL.TextureEffect.AddBlendSelect(op,"Blend Mode","normal"),
    amount=op.inValueSlider("Amount",1);

const inLayerMode = op.inValueSelect("mode",[
    "exponential",
    "logarithmic",
    "linear"
], "exponential");
const inRGBA = op.inValueBool("RGBA");
const inScale = op.inValue("scale",4);
const inNumLayers = op.inValueInt("layers",3);
const inFactor = op.inValue("factor",1);
const inExponent = op.inValue("exponent",1.3);
const inScrollX = op.inValue("scrollX");
const inScrollY = op.inValue("scrollY");
const inScrollZ = op.inValue("scrollZ");

// outputs
const outTrigger = op.outTrigger("trigger");

// locals
const TEX_SLOT=0;
const shader = new CGL.Shader(cgl);
const attribs = [inScale.get(),inNumLayers.get(),inFactor.get(),0];
shader.setSource(shader.getDefaultVertexShader(),attachments.layernoise_frag);
shader.addUniform(
    new CGL.Uniform(shader,"4f","attribs",attribs)
);
const uniMode = new CGL.Uniform(shader, "i", "mode", 1);
shader.addUniform(uniMode);
const uniRGBA = new CGL.Uniform(shader, "b", "rgba", false);
const scroll = [inScrollX.get(),inScrollY.get(),inScrollZ.get()];
const uniScroll = new CGL.Uniform(shader, "3f", "scroll", scroll);
const uniformAmount=new CGL.Uniform(shader,'f','amount',amount);
const textureUniform=new CGL.Uniform(shader,'t','tex',TEX_SLOT);

CGL.TextureEffect.setupBlending(op,shader,blendMode,amount);

var needsUpdate=false;
// events
inTrigger.onTriggered = function () {
    if(!CGL.TextureEffect.checkOpInEffect(op)) return;

    if(needsUpdate)
    {
        attribs[0] = inScale.get();
        attribs[1] = inNumLayers.get();

        var layerMode = inLayerMode.get();
        if (layerMode == "linear")
            uniMode.set(0);
        else if (layerMode == "exponential")
            uniMode.set(1);
        else
            uniMode.set(2);

        attribs[2] = inFactor.get();
        attribs[3] = inExponent.get();
        uniRGBA.set(inRGBA.get());
        scroll[0] = inScrollX.get();
        scroll[1] = inScrollY.get();
        scroll[2] = inScrollZ.get();
        uniScroll.set(scroll);
        needsUpdate=false;


    }

    cgl.setTexture(TEX_SLOT, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();
    cgl.currentTextureEffect.finish();
    cgl.popShader();
    outTrigger.trigger();

    // console.log(shader.finalShaderFrag);
};


var tile=op.inValueBool("Tileable",false);
tile.onChange=updateTileable;
function updateTileable()
{
    if(tile.get())shader.define("DO_TILEABLE");
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
inScrollZ.onChange =
function () {
    needsUpdate=true;
};

