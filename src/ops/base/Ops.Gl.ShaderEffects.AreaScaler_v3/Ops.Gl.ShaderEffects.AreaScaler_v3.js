const
    exec = op.inTrigger("render"),
    inSize = op.inValue("Area size", 1),
    inSrc = op.inSwitch("Source", ["Vertex position", "Object position"], "Vertex position"),
    inStrength = op.inValue("Strength", 1),
    inSmooth = op.inValueBool("Smoothstep", false),
    inToZero = op.inValueBool("Min Size Original", false),
    inClampBool = op.inBool("Clamp size", false),
    inClampMin = op.inFloat("Clamp min", 0),
    inClampMax = op.inFloat("Clamp max", 1.0),
    x = op.inValue("Pos X"),
    y = op.inValue("Pos Y"),
    z = op.inValue("Pos Z"),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
let needsUpdateToZero = true;
const mscaleUni = null;
let shader = null;

op.setPortGroup("Position", [x, y, z]);
op.setPortGroup("Influence", [inSrc, inStrength, inSmooth, inToZero]);

const srcBodyVert = ""
    .endl() + "pos=MOD_scaler(pos,mMatrix*pos,attrVertNormal,mMatrix);" // modelMatrix*
    .endl();

let moduleVert = null;

// op.onDelete = exec.onLinkChanged = removeModule;
inToZero.onChange = inSrc.onChange = inClampBool.onChange = updateToZero;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 2,
    "title": "vert_" + op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.areascale_vert,
    "srcBodyVert": srcBodyVert
});


mod.addUniform("f", "MOD_size", inSize);
mod.addUniform("f", "MOD_strength", inStrength);
mod.addUniform("b", "MOD_smooth", inSmooth);

mod.addUniform("f", "MOD_clampMin", inClampMin);
mod.addUniform("f", "MOD_clampMax", inClampMax);

mod.addUniform("f", "MOD_x", x);
mod.addUniform("f", "MOD_y", y);
mod.addUniform("f", "MOD_z", z);


// function removeModule()
// {
//     if (shader && moduleVert) shader.removeModule(moduleVert);
//     shader = null;
// }

function updateToZero()
{
    // if (!shader)
    // {
    //     needsUpdateToZero = true;
    //     return;
    // }

    mod.toggleDefine("MOD_TO_ZERO", inToZero.get());
    mod.toggleDefine("MOD_OBJECT_POS", inSrc.get() == "Object position");
    mod.toggleDefine("MOD_CLAMP_SIZE", inClampBool.get());

    needsUpdateToZero = false;

    inClampMin.setUiAttribs({ "greyout": !inClampBool.get() });
    inClampMax.setUiAttribs({ "greyout": !inClampBool.get() });
}


exec.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        next.trigger();
        return;
    }

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

    // if (cgl.getShader() != shader)
    // {
    //     if (shader) removeModule();
    //     shader = cgl.getShader();

    //     moduleVert = shader.addModule(
    //         {
    //             "title": op.objName,
    //             "name": "MODULE_VERTEX_POSITION",
    //             "srcHeadVert": attachments.areascale_vert,
    //             "srcBodyVert": srcBodyVert
    //         });

    //     inSize.uniform = new CGL.Uniform(shader, "f", "MOD_size", inSize);
    //     inStrength.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "strength", inStrength);
    //     inSmooth.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "smooth", inSmooth);

    //     x.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "x", x);
    //     y.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "y", y);
    //     z.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "z", z);

    //     inClampMin.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "clampMin", inClampMin);
    //     inClampMax.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "clampMax", inClampMax);
    // }

    if (needsUpdateToZero)updateToZero();
    // if (!shader) return;


    mod.bind();
    next.trigger();
    mod.unbind();
};
