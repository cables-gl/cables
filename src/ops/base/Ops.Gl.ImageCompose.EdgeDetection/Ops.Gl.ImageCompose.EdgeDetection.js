let render = op.inTrigger("Render");
let trigger = op.outTrigger("Trigger");
let amount = op.inValueSlider("amount", 1);
let mulColor = op.inValueSlider("Mul Color", 0);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.edgedetect_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

let uniWidth = new CGL.Uniform(shader, "f", "texWidth", 128);
let uniHeight = new CGL.Uniform(shader, "f", "texHeight", 128);
let uniMulColor = new CGL.Uniform(shader, "f", "mulColor", mulColor);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
