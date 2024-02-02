const
    render = op.inTrigger("render"),
    next = op.outTrigger("Trigger"),

    transX = op.inValue("Translate X", 0),
    transY = op.inValue("Translate Y", 0),

    scaleX = op.inValue("Repeat X", 1),
    scaleY = op.inValue("Repeat Y", 1),

    inFlipX = op.inBool("Flip X", false),
    inFlipY = op.inBool("Flip Y", false),

    rot = op.inFloat("Rotation", 0);
const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "priority": -2,
    "name": "MODULE_VERTEX_POSITION",
    "srcBodyVert": attachments.trans_vert || ""
});

mod.addUniformVert("2f", "MOD_trans", transX, transY);
mod.addUniformVert("2f", "MOD_scale", scaleX, scaleY);
mod.addUniformVert("f", "MOD_rot", rot);

inFlipX.onChange =
    inFlipY.onChange = updateDefines;

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_FLIPX", inFlipX.get());
    mod.toggleDefine("MOD_FLIPY", inFlipY.get());
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};
