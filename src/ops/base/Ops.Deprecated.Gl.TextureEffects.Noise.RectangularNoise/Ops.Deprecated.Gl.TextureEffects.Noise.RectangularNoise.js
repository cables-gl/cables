op.name = "RectangularNoise";

let render = op.inTrigger("render");


let blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
let amount = op.inValueSlider("Amount", 1);

let threshold = op.inValueSlider("Threshold", 0.35);

let x = op.inValue("X", 0);
let y = op.inValue("Y", 0);
let z = op.inValue("Z", 0);
let scale = op.inValue("Scale", 22);


let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

let srcFrag = attachments.movingrectnoise_frag.replace("{{BLENDCODE}}", CGL.TextureEffect.getBlendCode());

shader.setSource(shader.getDefaultVertexShader(), srcFrag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

let uniZ = new CGL.Uniform(shader, "f", "z", z);
let uniX = new CGL.Uniform(shader, "f", "x", x);
let uniY = new CGL.Uniform(shader, "f", "y", y);
let uniScale = new CGL.Uniform(shader, "f", "scale", scale);
let uniThreshold = new CGL.Uniform(shader, "f", "threshold", threshold);

let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

blendMode.onChange = function ()
{
    CGL.TextureEffect.onChangeBlendSelect(shader, blendMode.get());
};

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
