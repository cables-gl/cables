const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    strength = op.inValue("Strength", 4),
    sizeMul = op.inValue("Step Multiplier", 1);

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name);

// from: https://forum.openframeworks.cc/t/compute-normal-map-from-image/1400/11
shader.setSource(shader.getDefaultVertexShader(), attachments.tonormal_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniStrength = new CGL.Uniform(shader, "f", "strength", strength),
    unisizeMul = new CGL.Uniform(shader, "f", "sizeMul", sizeMul),
    uniSize = new CGL.Uniform(shader, "2f", "size", 0, 0);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    const effectTex = cgl.currentTextureEffect.getCurrentSourceTexture();

    cgl.setTexture(0, effectTex.tex);

    uniSize.setValue([1 / effectTex.width, 1 / effectTex.height]);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
