const render = op.inTrigger("render");
const amount = op.inValueSlider("amount X");
const amountY = op.inValueSlider("amount Y");

const displaceTex = op.inTexture("displaceTex");
const trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.pixeldisplace_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let textureDisplaceUniform = new CGL.Uniform(shader, "t", "displaceTex", 1);

let amountXUniform = new CGL.Uniform(shader, "f", "amountX", amount);
let amountYUniform = new CGL.Uniform(shader, "f", "amountY", amountY);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (displaceTex.get()) cgl.setTexture(1, displaceTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
