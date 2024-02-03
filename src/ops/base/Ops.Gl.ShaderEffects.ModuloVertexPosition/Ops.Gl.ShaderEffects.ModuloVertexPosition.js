const
    render = op.inTrigger("render"),
    axis = op.inValueSelect("Axis", ["X", "Y", "Z"], "X"),
    inModu = op.inFloat("Modulo", 1),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "srcBodyVert": attachments.trans_vert || ""
});

mod.addUniformVert("f", "MOD_modulo", inModu);

axis.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_AXIS_X", axis.get() == "X");
    mod.toggleDefine("MOD_AXIS_Y", axis.get() == "Y");
    mod.toggleDefine("MOD_AXIS_Z", axis.get() == "Z");
}

render.onTriggered = function ()
{
    mod.bind();
    trigger.trigger();
    mod.unbind();
};
