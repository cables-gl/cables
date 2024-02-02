const
    mappings = ["Reinhard", "Photographic", "ACES", "HejiDawson", "AGX", "AGX Golden", "AGX Punchy", "Uncharted", "Unreal", "Tanh"],

    render = op.inTrigger("render"),
    inAct = op.inBool("Active", true),
    inMap = op.inDropDown("Mapping", mappings, "Photographic"),
    inAdjust = op.inFloat("Multiply", 1),

    inGammaCorrect = op.inBool("Gamma Correct", true),
    inGamma = op.inFloat("Gamma", 2.2),
    trigger = op.outTrigger("trigger"),
    outSelected = op.outString("Selected Mapping");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.map_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
const adjustUni = new CGL.Uniform(shader, "f", "adjust", inAdjust);
const gammaUni = new CGL.Uniform(shader, "f", "gamma", inGamma);

inAct.onChange =
inGammaCorrect.onChange =
inMap.onChange = () =>
{
    const m = inMap.get() || "";
    shader.toggleDefine("MAP_NONE", m == "None");
    shader.toggleDefine("MAP_ACES", m == "ACES");
    shader.toggleDefine("MAP_AGX", m.indexOf("AGX") > -1);
    shader.toggleDefine("AGX_LOOK_1", m == "AGX Golden");
    shader.toggleDefine("AGX_LOOK_2", m == "AGX Punchy");
    shader.toggleDefine("MAP_UNCHARTED", m == "Uncharted");
    shader.toggleDefine("MAP_UNREAL", m == "Unreal");
    shader.toggleDefine("MAP_TANH", m == "Tanh");
    shader.toggleDefine("MAP_REINHARD", m == "Reinhard");
    shader.toggleDefine("MAP_PHOTO", m == "Photographic");
    shader.toggleDefine("MAP_HEJ", m == "HejiDawson");

    shader.toggleDefine("DO_MAP", inAct.get());
    shader.toggleDefine("GAMMA_CORRECT", inGammaCorrect.get());

    inGamma.setUiAttribs({ "greyout": !inGammaCorrect.get() });

    inMap.setUiAttribs({ "greyout": !inAct.get() });
    inAdjust.setUiAttribs({ "greyout": !inAct.get() });

    outSelected.set(m);
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
