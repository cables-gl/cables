const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inScale = op.inValue("Scale", 10),
    inAmount = op.inValueSlider("Amount", 0.3),
    inBlend = op.inSwitch("Blendmode", ["Sub", "Add", "Mul"], "Sub"),
    inWorldSpace = op.inValueBool("WorldSpace"),
    r = op.inValueSlider("r", 0),
    g = op.inValueSlider("g", 0),
    b = op.inValueSlider("b", 0),
    x = op.inFloat("x", 0),
    y = op.inFloat("y", 0),
    z = op.inFloat("z", 0);

r.setUiAttribs({ "colorPick": true });

op.setPortGroup("Color", [r, g, b]);
op.setPortGroup("Position", [x, y, z]);
const cgl = op.patch.cgl;

inBlend.onChange =
inWorldSpace.onChange = updateDefines;

const srcHeadVert = ""
    .endl() + "OUT vec4 MOD_pos;"
    .endl();

const srcBodyVert = ""
    .endl() + "#ifndef MOD_WORLDSPACE"
    .endl() + "   MOD_pos=vec4(pos.xyz,1.0);"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_WORLDSPACE"
    .endl() + "   MOD_pos=vec4(pos.xyz,1.0)*mMatrix;"
    .endl() + "#endif"
    .endl();

const srcHeadFrag = attachments.pixelnoise_frag;

const srcBodyFrag = ""
    .endl() + "vec3 MOD_rndVal = vec3(1.-MOD_r,1.-MOD_g,1.-MOD_b)*MOD_meshPixelNoise(MOD_pos.xyz*MOD_scale)*MOD_amount/4.0;"

    .endl() + "#ifdef MOD_BLEND_MUL"
    .endl() + "   col.rgb *= MOD_rndVal;"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_BLEND_SUB"
    .endl() + "   col.rgb -= MOD_rndVal;"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_BLEND_ADD"
    .endl() + "   col.rgb += MOD_rndVal;"
    .endl() + "#endif"
    .endl();

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.pixelnoise_frag,
    "srcBodyFrag": srcBodyFrag
});

mod.addUniformFrag("f", "MOD_scale", inScale);
mod.addUniformFrag("f", "MOD_amount", inAmount);
mod.addUniformFrag("f", "MOD_r", r);
mod.addUniformFrag("f", "MOD_g", g);
mod.addUniformFrag("f", "MOD_b", b);
mod.addUniformFrag("f", "MOD_x", x);
mod.addUniformFrag("f", "MOD_y", y);
mod.addUniformFrag("f", "MOD_z", z);
updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());

    mod.toggleDefine("MOD_BLEND_ADD", inBlend.get() == "Add");
    mod.toggleDefine("MOD_BLEND_SUB", inBlend.get() == "Sub");
    mod.toggleDefine("MOD_BLEND_MUL", inBlend.get() == "Mul");
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};
