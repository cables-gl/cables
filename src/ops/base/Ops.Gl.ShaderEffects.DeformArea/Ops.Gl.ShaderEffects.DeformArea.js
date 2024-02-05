const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inSize = op.inValue("Size", 1),
    inStrength = op.inValue("Strength", 0.5),
    inSmooth = op.inValueBool("Smooth", true),
    inWorldSpace = op.inValueBool("WorldSpace", false),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z");

const cgl = op.patch.cgl;

inWorldSpace.onChange = updateWorldspace;

// let shader = null;
const srcHeadVert = attachments.deformarea_vert;

const srcBodyVert = ""
    .endl() + "pos=MOD_deform(pos,mMatrix);"
    .endl();

// let moduleVert = null;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.deformarea_vert,
    "srcBodyVert": srcBodyVert
});

mod.addUniformVert("f", "MOD_size", inSize);
mod.addUniformVert("f", "MOD_strength", inStrength);
mod.addUniformVert("f", "MOD_smooth", inSmooth);

mod.addUniformVert("f", "MOD_x", x);
mod.addUniformVert("f", "MOD_y", y);
mod.addUniformVert("f", "MOD_z", z);

render.onTriggered = function ()
{
    if (CABLES.UI)
    {
        if (op.isCurrentUiOp()) gui.setTransformGizmo({ "posX": x, "posY": y, "posZ": z });

        if (cgl.shouldDrawHelpers(op))
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);
            CABLES.GL_MARKER.drawSphere(op, inSize.get());
            cgl.popModelMatrix();
        }
    }

    mod.bind();
    next.trigger();
    mod.unbind();
};

function updateWorldspace()
{
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
}
