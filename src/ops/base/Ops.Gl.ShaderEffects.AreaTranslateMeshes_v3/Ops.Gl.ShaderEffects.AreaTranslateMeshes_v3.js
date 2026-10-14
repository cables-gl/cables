const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inSize = op.inFloat("Size", 1),
    inStrength = op.inFloat("Strength", 0.5),
    x = op.inFloat("x"),
    y = op.inFloat("y"),
    z = op.inFloat("z"),
    mulx = op.inFloat("Multiply x", 1),
    muly = op.inFloat("Multiply y", 1),
    mulz = op.inFloat("Multiply z", 1);

const cgl = op.patch.cgl;

op.setPortGroup("Area Position", [x, y, z]);
op.setPortGroup("Axis Multiply", [mulx, muly, mulz]);

const needsUpdateToZero = true;
const mscaleUni = null;
let shader = null;
const srcHeadVert = attachments.areascale_vert;
const uniforms = {};
const srcBodyVert = ""
    .endl() + "mMatrix=MOD_translate(mMatrix);" // modelMatrix*
    .endl();

let moduleVert = null;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});

mod.addUniformVert("f", "MOD_size", inSize);
mod.addUniformVert("f", "MOD_strength", inStrength);

mod.addUniformVert("3f", "MOD_pos", x, y, z);
mod.addUniformVert("3f", "MOD_mul", mulx, muly, mulz);

render.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        next.trigger();
        return;
    }

    if (CABLES.UI)
    {
        if (op.isCurrentUiOp())
            gui.setTransformGizmo(
                {
                    "posX": x,
                    "posY": y,
                    "posZ": z
                });

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
