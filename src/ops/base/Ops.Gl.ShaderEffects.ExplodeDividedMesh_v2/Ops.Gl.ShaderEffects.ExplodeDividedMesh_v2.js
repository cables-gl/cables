const
    render = op.inTrigger("Render"),
    inDistance = op.inValue("Distance", 1),
    inSize = op.inValue("Size", 1),

    inAbsolute = op.inValueBool("Absolute", false),
    x = op.inValue("add x"),
    y = op.inValue("add y"),
    z = op.inValue("add z"),

    mulx = op.inValue("mul x", 1),
    muly = op.inValue("mul y", 1),
    mulz = op.inValue("mul z", 1),

    posx = op.inValue("x"),
    posy = op.inValue("y"),
    posz = op.inValue("z"),

    next = op.outTrigger("Next");

op.setPortGroup("Add", [x, z, y]);
op.setPortGroup("Multiply", [mulx, mulz, muly]);
op.setPortGroup("Position", [posx, posz, posy]);

const cgl = op.patch.cgl;
const srcHeadVert = attachments.explode_divided_mesh_vert;

const srcBodyVert = ""
    .endl() + "pos=MOD_deform(pos,attrVertNormal,attrVertIndex);"
    .endl();

inAbsolute.onChange = function ()
{
    mod.toggleDefine("MOD_ABSOLUTE", inAbsolute.get());
};

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});

mod.addUniform("f", "MOD_dist", inDistance);

mod.addUniform("f", "MOD_x", x);
mod.addUniform("f", "MOD_y", y);
mod.addUniform("f", "MOD_z", z);

mod.addUniform("f", "MOD_mulx", mulx);
mod.addUniform("f", "MOD_muly", muly);
mod.addUniform("f", "MOD_mulz", mulz);

mod.addUniform("f", "MOD_posx", posx);
mod.addUniform("f", "MOD_posy", posy);
mod.addUniform("f", "MOD_posz", posz);

mod.addUniform("f", "MOD_size", inSize);

render.onTriggered = function ()
{
    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": posx,
                "posY": posy,
                "posZ": posz
            });

    mod.bind();
    next.trigger();
    mod.unbind();
};













