const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("Trigger"),
    amount = op.inFloat("Degree", 180),
    height = op.inFloat("Height", 2),
    axis = op.inValueSelect("Axis", ["X", "Y", "Z"], "Y");

const cgl = op.patch.cgl;

axis.onChange = updateAxis;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.twist_head_vert,
    "srcBodyVert": attachments.twist_vert
});

updateAxis();

mod.addUniformVert("f", "MOD_amount", amount);
mod.addUniformVert("f", "MOD_height", height);

function updateAxis()
{
    mod.toggleDefine("MOD_AXIS_X", axis.get() == "X");
    mod.toggleDefine("MOD_AXIS_Y", axis.get() == "Y");
    mod.toggleDefine("MOD_AXIS_Z", axis.get() == "Z");
}

render.onTriggered = function ()
{
    if (cgl.shouldDrawHelpers(op))
    {
        CABLES.GL_MARKER.drawCube(op, 1, height.get() / 2, 1);
    }

    mod.bind();
    trigger.trigger();
    mod.unbind();
};
