const
    render = op.inTrigger("Render"),
    w = op.inValueSlider("WeightMul", 0.6),
    inR = op.inFloat("R", Math.random()),
    inG = op.inFloat("G", Math.random()),
    inB = op.inFloat("B", Math.random()),
    trigger = op.outTrigger("Next");

op.setPortGroup("Color", [inR, inG, inB]);
inR.setUiAttribs({ "colorPick": true });

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.chromakey_frag);

new CGL.Uniform(shader, "t", "tex", 0),
new CGL.Uniform(shader, "3f", "color", inR, inG, inB),
new CGL.Uniform(shader, "f", "weightMul", w);

render.onTriggered = function ()
{
    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};
