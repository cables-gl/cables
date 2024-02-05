const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    axis = op.inValueSelect("Axis", ["X", "Y", "Z"], "X"),
    min = op.inValue("min", 0),
    max = op.inValue("max", 1),
    inUpdateNormals = op.inValueBool("Update Normals");

const cgl = op.patch.cgl;

let shader = null;
let moduleVert = null;

const vertModTitle = "vert_" + op.name;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 2,
    "title": vertModTitle,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.restrictVertex_vert
});

const minUniform = mod.addUniform("f", "MOD_min", min);
const maxUniform = mod.addUniform("f", "MOD_max", max);

axis.onChange =
    inUpdateNormals.onChange = updateDefines;

function updateDefines()
{
    mod.toggleDefine("RESTRICT_UPDATENORMALS", inUpdateNormals.get());
    mod.toggleDefine("MOD_RESTRICT_AXIS_X", axis.get() == "X");
    mod.toggleDefine("MOD_RESTRICT_AXIS_Y", axis.get() == "Y");
    mod.toggleDefine("MOD_RESTRICT_AXIS_Z", axis.get() == "Z");
}

render.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        next.trigger();
        return;
    }

    mod.bind();
    next.trigger();
    mod.unbind();
};
