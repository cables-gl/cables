const
    render = op.inTrigger("render"),
    axis=op.inValueSelect("Axis",["X","Y","Z"],"X");
    inModu=op.inFloat("Modulo",1),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name);

mod.addModule({
    // "priority": -2,
    "name": "MODULE_VERTEX_POSITION",
    // "srcHeadVert": attachments.trans_head_vert || "",
    "srcBodyVert": attachments.trans_vert || ""
});

mod.addUniformVert("f", "MOD_modulo", inModu);

axis.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_AXIS", axis.get());
}

render.onTriggered = function ()
{
    mod.bind();
    trigger.trigger();
    mod.unbind();
};
