const
    render = op.inTrigger("render"),
    inMeth = op.inSwitch("Output RGB", ["HSB", "Hue", "Sat", "Bright", "Sat*Bright"], "HSB"),
    trigger = op.outTrigger("trigger"),
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.tonormal_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

inMeth.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("OUT_HSB", inMeth.get() == "HSB");
    shader.toggleDefine("OUT_H", inMeth.get() == "Hue");
    shader.toggleDefine("OUT_S", inMeth.get() == "Sat");
    shader.toggleDefine("OUT_B", inMeth.get() == "Bright");
    shader.toggleDefine("OUT_SB", inMeth.get() == "Sat*Bright");
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
