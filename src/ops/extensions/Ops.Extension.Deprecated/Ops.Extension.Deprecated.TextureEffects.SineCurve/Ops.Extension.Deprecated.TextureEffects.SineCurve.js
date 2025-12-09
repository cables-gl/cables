let render = op.inTrigger("render");

let blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
let amount = op.inValueSlider("Amount", 1);

let fill = op.inValueBool("Fill", false);
let offset = op.inValue("offset", 0);
let frequency = op.inValue("frequency", 10);
let amplitude = op.inValueSlider("amplitude", 1);
let thick = op.inValueSlider("Thickness", 0.1);

let flip = op.inValueBool("Flip", false);

let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);
let tsize = [128, 128];

let srcFrag = attachments.sinecurve_frag;
srcFrag = srcFrag.replace("{{BLENDCODE}}", CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let offsetUniform = new CGL.Uniform(shader, "f", "offset", offset);
let frequencyUniform = new CGL.Uniform(shader, "f", "frequency", frequency);
let amplitudeUniform = new CGL.Uniform(shader, "f", "amplitude", amplitude);
let thickUniform = new CGL.Uniform(shader, "f", "thick", thick);
let texSizeUniform = new CGL.Uniform(shader, "2f", "texSize", tsize);
let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

flip.onChange = updateFlip;
fill.onChange = updateFill;

function updateFlip()
{
    if (flip.get()) shader.define("FLIP");
    else shader.removeDefine("FLIP");
}

function updateFill()
{
    if (fill.get()) shader.define("FILL");
    else shader.removeDefine("FILL");
}

blendMode.onChange = function ()
{
    CGL.TextureEffect.onChangeBlendSelect(shader, blendMode.get());
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    tsize[0] = cgl.currentTextureEffect.getCurrentSourceTexture().width;
    tsize[1] = cgl.currentTextureEffect.getCurrentSourceTexture().height;
    texSizeUniform.setValue(tsize);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
