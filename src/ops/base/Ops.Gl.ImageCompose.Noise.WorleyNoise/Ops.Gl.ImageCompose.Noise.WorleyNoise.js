let render = op.inTrigger("render");

let blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
let amount = op.inValueSlider("Amount", 1);

let x = op.inValue("X", 0);
let y = op.inValue("Y", 0);
let z = op.inValue("Z", 0);
let scale = op.inValue("Scale", 22);
let inv = op.inValueBool("Invert", true);

let rangeA = op.inValueSlider("RangeA", 0.4);
let rangeB = op.inValueSlider("RangeB", 0.5);

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.worleynoise_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

const uniZ = new CGL.Uniform(shader, "f", "z", z);
const uniX = new CGL.Uniform(shader, "f", "x", x);
const uniY = new CGL.Uniform(shader, "f", "y", y);
const uniScale = new CGL.Uniform(shader, "f", "scale", scale);
const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
const rangeAUniform = new CGL.Uniform(shader, "f", "rangeA", rangeA);
const rangeBUniform = new CGL.Uniform(shader, "f", "rangeB", rangeB);

inv.onChange = updateInvert;
updateInvert();

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

function updateInvert()
{
    if (inv.get())shader.define("DO_INVERT");
    else shader.removeDefine("DO_INVERT");
}

let tile = op.inValueBool("Tileable", false);
tile.onChange = updateTileable;
function updateTileable()
{
    if (tile.get())shader.define("DO_TILEABLE");
    else shader.removeDefine("DO_TILEABLE");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
