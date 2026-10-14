const
    render = op.inTrigger("Render"),
    inDistance = op.inFloat("Distance", 1),
    inSize = op.inFloat("Size", 1),

    inAbsolute = op.inBool("Absolute", false),
    x = op.inFloat("add x"),
    y = op.inFloat("add y"),
    z = op.inFloat("add z"),

    mulx = op.inFloat("mul x", 1),
    muly = op.inFloat("mul y", 1),
    mulz = op.inFloat("mul z", 1),

    posx = op.inFloat("x"),
    posy = op.inFloat("y"),
    posz = op.inFloat("z"),

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













