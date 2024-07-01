op.name = "Vignette";

let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let amount = op.inValueSlider("Amount", 1);
let lensRadius1 = op.inValue("lensRadius1", 0.8);
let lensRadius2 = op.inValue("lensRadius2", 0.4);
let ratio = op.inValue("Ratio", 1);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.vignette_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let uniLensRadius1 = new CGL.Uniform(shader, "f", "lensRadius1", lensRadius1);
let uniLensRadius2 = new CGL.Uniform(shader, "f", "lensRadius2", lensRadius2);
let uniRatio = new CGL.Uniform(shader, "f", "ratio", ratio);
let uniAmount = new CGL.Uniform(shader, "f", "amount", amount);

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
