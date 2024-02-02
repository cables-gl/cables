const
    render = op.inTrigger("render"),
    inSize = op.inValue("Size", 1),
    inStrength = op.inValue("Strength", 1),
    inSmooth = op.inValueBool("Smooth", true),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const srcBodyVert = ""
    .endl() + "pos=MOD_scaler(pos,mMatrix);"
    .endl();

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "priority": 2,
    "title": "vert" + op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.area_rotate_vert,
    "srcBodyVert": srcBodyVert
});

mod.addUniform("f", "MOD_x", x);
mod.addUniform("f", "MOD_y", y);
mod.addUniform("f", "MOD_z", z);

mod.addUniform("f", "MOD_size", inSize);
mod.addUniform("f", "MOD_strength", inStrength);
mod.addUniform("b", "MOD_smooth", inSmooth);


render.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        next.trigger();
        return;
    }

    if (op.isCurrentUiOp()) gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

    mod.bind();
    next.trigger();
    mod.unbind();
};
