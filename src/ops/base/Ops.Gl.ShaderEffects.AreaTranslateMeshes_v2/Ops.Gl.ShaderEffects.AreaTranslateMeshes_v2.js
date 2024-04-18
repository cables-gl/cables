const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inSize = op.inValue("Size", 1),
    inStrength = op.inValue("Strength", 0.5),
    inSmooth = op.inValueBool("Smooth", true),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    mulx = op.inValue("Multiply x", 1),
    muly = op.inValue("Multiply y", 1),
    mulz = op.inValue("Multiply z", 1);

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
// mod.addUniformVert("i", "MOD_smooth", inSmooth);

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

        if (op.isCurrentUiOp() || gui.shouldDrawOverlay)
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix, cgl.mMatrix, [x.get(), y.get(), z.get()]);
            CABLES.GL_MARKER.drawSphere(op, inSize.get());
            cgl.popModelMatrix();
        }
    }

    // if (cgl.getShader() != shader)
    // {
    // if (shader) removeModule();
    // shader = cgl.getShader();

    // moduleVert = shader.addModule(
    //     {
    //         "title": op.objName,
    //         "name": "MODULE_VERTEX_POSITION",
    //         srcHeadVert,
    //         srcBodyVert
    //     });

    // uniforms.inSize = new CGL.Uniform(shader, "f", moduleVert.prefix + "size", inSize);
    // uniforms.inStrength = new CGL.Uniform(shader, "f", moduleVert.prefix + "strength", inStrength);
    // uniforms.inSmooth = new CGL.Uniform(shader, "f", moduleVert.prefix + "smooth", inSmooth);

    // uniforms.x = new CGL.Uniform(shader, "f", moduleVert.prefix + "x", x);
    // uniforms.y = new CGL.Uniform(shader, "f", moduleVert.prefix + "y", y);
    // uniforms.z = new CGL.Uniform(shader, "f", moduleVert.prefix + "z", z);
    // }

    // if (!shader) return;
    mod.bind();
    next.trigger();
    mod.unbind();
};
