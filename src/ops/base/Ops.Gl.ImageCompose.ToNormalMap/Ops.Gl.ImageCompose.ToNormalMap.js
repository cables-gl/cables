let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");
let strength = op.inValue("Strength", 4);
let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

// from: https://forum.openframeworks.cc/t/compute-normal-map-from-image/1400/11

shader.setSource(shader.getDefaultVertexShader(), attachments.tonormal_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let uniStrength = new CGL.Uniform(shader, "f", "strength", strength);

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
