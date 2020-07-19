const cgl = op.patch.cgl;

const inTrigger = op.inTrigger("Trigger In");
const inActive = op.inBool("Active", true);
const inR = op.inFloatSlider("R", Math.random());
const inG = op.inFloatSlider("G", Math.random());
const inB = op.inFloatSlider("B", Math.random());
inR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Color", [inR, inG, inB]);
const inIntensity = op.inFloat("Fresnel Intensity", 1);
const inExponent = op.inFloat("Fresnel Exponent", 2.5);
op.setPortGroup("Fresnel Settings", [inIntensity, inExponent]);

inActive.onChange = () =>
{
    mod.toggleDefine("ENABLE_FRESNEL_MOD", inActive);
    inR.setUiAttribs({ "greyout": !inActive.get() });
    inG.setUiAttribs({ "greyout": !inActive.get() });
    inB.setUiAttribs({ "greyout": !inActive.get() });
    inIntensity.setUiAttribs({ "greyout": !inActive.get() });
    inExponent.setUiAttribs({ "greyout": !inActive.get() });
};

const outTrigger = op.outTrigger("Trigger Out");


const mod = new CGL.ShaderModifier(cgl, "fresnelGlow");
mod.toggleDefine("ENABLE_FRESNEL_MOD", inActive);

mod.addModule({
    "priority": 2,
    "title": "fresnelGlow",
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.fresnel_head_vert,
    "srcBodyVert": attachments.fresnel_body_vert
});

mod.addModule({
    "title": "fresnelGlow",
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.fresnel_head_frag,
    "srcBodyFrag": attachments.fresnel_body_frag
});

mod.addUniform("4f", "MOD_inFresnel", inR, inG, inB, inIntensity);
mod.addUniform("f", "MOD_inFresnelExponent", inExponent);

inTrigger.onTriggered = () =>
{
    mod.bind();
    outTrigger.trigger();
    mod.unbind();
};
