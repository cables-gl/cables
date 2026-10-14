const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("Trigger"),
    transX = op.inFloat("Translate X", 0),
    transY = op.inFloat("Translate Y", 0),
    transZ = op.inFloat("Translate Z", 0),

    scaleX = op.inFloat("Scale X", 1),
    scaleY = op.inFloat("Scale Y", 1),
    scaleZ = op.inFloat("Scale Z", 1),

    rotX = op.inFloat("Rotation X", 0),
    rotY = op.inFloat("Rotation Y", 0),
    rotZ = op.inFloat("Rotation Z", 0),
    transNorm = op.inBool("Transform normals", false);

const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "priority": -2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.trans_head_vert || "",
    "srcBodyVert": attachments.trans_vert || ""
});

mod.addUniformVert("3f", "MOD_translate", transX, transY, transZ);
mod.addUniformVert("3f", "MOD_scale", scaleX, scaleY, scaleZ);
mod.addUniformVert("3f", "MOD_rot", rotX, rotY, rotZ);

transNorm.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_TRANS_NORMS", transNorm.get());
}

render.onTriggered = function ()
{
    mod.bind();
    trigger.trigger();
    mod.unbind();
};
