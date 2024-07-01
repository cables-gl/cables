op.name = "PixelSort";

let render = op.inTrigger("Render");
let trigger = op.outTrigger("Trigger");
let amount = op.inValueSlider("amount", 0.5);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.pixelsort_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);
let uniPixelSize = new CGL.Uniform(shader, "f", "pixelX", 1 / 1024);

render.onTriggered = function ()
{
    if (!cgl.currentTextureEffect) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniPixelSize.setValue(1 / cgl.currentTextureEffect.getCurrentSourceTexture().width);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
