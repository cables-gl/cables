const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inFloatSlider("Amount", 1),
    r = op.inFloatSlider("r", 1.0),
    g = op.inFloatSlider("g", 1.0),
    b = op.inFloatSlider("b", 1.0),
    trigger = op.outTrigger("trigger");

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "fbmnoise");

shader.setSource(shader.getDefaultVertexShader(), attachments.fbmnoise_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

const uniScale = new CGL.Uniform(shader, "f", "scale", op.inFloat("scale", 2));
const uniAnim = new CGL.Uniform(shader, "f", "anim", op.inFloat("anim", 0));
const uniScrollX = new CGL.Uniform(shader, "f", "scrollX", op.inFloat("scrollX", 9));
const uniScrollY = new CGL.Uniform(shader, "f", "scrollY", op.inFloat("scrollY", 0));
const uniRepeat = new CGL.Uniform(shader, "f", "repeat", op.inFloat("repeat", 1));
const uniAspect = new CGL.Uniform(shader, "f", "aspect", op.inFloat("aspect", 1));

const uniLayer1 = new CGL.Uniform(shader, "b", "layer1", op.inBool("Layer 1", true));
const uniLayer2 = new CGL.Uniform(shader, "b", "layer2", op.inBool("Layer 2", true));
const uniLayer3 = new CGL.Uniform(shader, "b", "layer3", op.inBool("Layer 3", true));
const uniLayer4 = new CGL.Uniform(shader, "b", "layer4", op.inBool("Layer 4", true));

const uniColor = new CGL.Uniform(shader, "3f", "color", r, g, b);

const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

const tile = op.inBool("Tileable", false);
tile.onChange = updateTileable;
function updateTileable()
{
    if (tile.get())shader.define("DO_TILEABLE");
    else shader.removeDefine("DO_TILEABLE");
}

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniAspect.set(cgl.currentTextureEffect.getCurrentSourceTexture().width / cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
