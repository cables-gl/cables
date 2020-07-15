
op.render = op.inTrigger("render");
op.trigger = op.outTrigger("trigger");

const inSize = op.inValue("Size", 1);
const inStrength = op.inValue("Strength", 1);
const inSmooth = op.inValueBool("Smooth", true);
const inToZero = op.inValueBool("Keep Min Size", true);

const cgl = op.patch.cgl;

const x = op.inValue("x");
const y = op.inValue("y");
const z = op.inValue("z");

let needsUpdateToZero = true;
const mscaleUni = null;

let shader = null;

const srcHeadVert = attachments.areascale_vert;

const srcBodyVert = ""
    .endl() + "pos=MOD_scaler(pos,mMatrix*pos,attrVertNormal);" // modelMatrix*
    .endl();

let moduleVert = null;

function removeModule()
{
    if (shader && moduleVert) shader.removeModule(moduleVert);
    shader = null;
}

inToZero.onChange = updateToZero;

function updateToZero()
{
    if (!shader)
    {
        needsUpdateToZero = true;
        return;
    }
    if (inToZero.get()) shader.removeDefine(moduleVert.prefix + "TO_ZERO");
    else shader.define(moduleVert.prefix + "TO_ZERO");

    needsUpdateToZero = false;
}


op.render.onLinkChanged = removeModule;

op.render.onTriggered = function ()
{
    if (!cgl.getShader())
    {
        op.trigger.trigger();
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


    if (cgl.getShader() != shader)
    {
        if (shader) removeModule();
        shader = cgl.getShader();

        moduleVert = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": srcBodyVert
            });


        inSize.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "size", inSize);
        inStrength.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "strength", inStrength);
        inSmooth.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "smooth", inSmooth);

        x.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "x", x);
        y.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "y", y);
        z.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "z", z);
    }


    if (needsUpdateToZero)updateToZero();

    if (!shader) return;

    op.trigger.trigger();
};
