const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    modeSelect = op.inValueSelect("Mode", ["Clamp", "Remap", "Remap smooth"], "Clamp"),

    inActiveR = op.inBool("R", true),
    inMinR = op.inValue("R Min", 0.0),
    inMaxR = op.inValue("R Max", 1.0),

    inActiveG = op.inBool("G", true),
    inMinG = op.inValue("G Min", 0.0),
    inMaxG = op.inValue("G Max", 1.0),

    inActiveB = op.inBool("B", true),
    inMinB = op.inValue("B Min", 0.0),
    inMaxB = op.inValue("B Max", 1.0),

    trigger = op.outTrigger("trigger");

op.setPortGroup("Red", [inMinR, inMaxR, inActiveR]);
op.setPortGroup("Green", [inMinG, inMaxG, inActiveG]);
op.setPortGroup("Blue", [inMinB, inMaxB, inActiveB]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.clampShader_frag);

new CGL.Uniform(shader, "t", "tex", 0);
new CGL.Uniform(shader, "f", "amount", amount);
new CGL.Uniform(shader, "f", "minR", inMinR);
new CGL.Uniform(shader, "f", "maxR", inMaxR);
new CGL.Uniform(shader, "f", "minG", inMinG);
new CGL.Uniform(shader, "f", "maxG", inMaxG);
new CGL.Uniform(shader, "f", "minB", inMinB);
new CGL.Uniform(shader, "f", "maxB", inMaxB);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

inActiveR.onChange =
inActiveG.onChange =
inActiveB.onChange =
modeSelect.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    shader.toggleDefine("CLAMP_R", inActiveR.get());
    shader.toggleDefine("CLAMP_G", inActiveG.get());
    shader.toggleDefine("CLAMP_B", inActiveB.get());

    inMinR.setUiAttribs({ "greyout": !inActiveR.get() });
    inMaxR.setUiAttribs({ "greyout": !inActiveR.get() });

    inMinG.setUiAttribs({ "greyout": !inActiveG.get() });
    inMaxG.setUiAttribs({ "greyout": !inActiveG.get() });

    inMinB.setUiAttribs({ "greyout": !inActiveB.get() });
    inMaxB.setUiAttribs({ "greyout": !inActiveB.get() });

    shader.toggleDefine("CLAMP", modeSelect.get() === "Clamp");
    shader.toggleDefine("REMAP", modeSelect.get() === "Remap");
    shader.toggleDefine("REMAP_SMOOTH", modeSelect.get() === "Remap smooth");
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
