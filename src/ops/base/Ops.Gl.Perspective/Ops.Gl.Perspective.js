// http://stackoverflow.com/questions/5504635/computing-fovx-opengl

const
    render = op.inTrigger("render"),
    fovY = op.inValueFloat("fov y", 45),
    zNear = op.inValueFloat("frustum near", 0.1),
    zFar = op.inValueFloat("frustum far", 20),
    autoAspect = op.inValueBool("Auto Aspect Ratio", true),
    aspect = op.inValue("Aspect Ratio"),
    trigger = op.outTrigger("trigger"),
    outAsp = op.outNumber("Aspect");

fovY.onChange = zFar.onChange = zNear.onChange = changed;

changed();

op.setPortGroup("Field of View", fovY);
op.setPortGroup("Frustrum", zNear, zFar);

let asp = 0;

render.onTriggered = function ()
{
    const cg = op.patch.cg;

    asp = cg.getViewPort()[2] / cg.getViewPort()[3];
    if (!autoAspect.get())asp = aspect.get();
    outAsp.set(asp);

    cg.pushPMatrix();
    mat4.perspective(
        cg.pMatrix,
        fovY.get() * 0.0174533,
        asp,
        zNear.get(),
        zFar.get());

    trigger.trigger();

    cg.popPMatrix();
};

function changed()
{
    op.patch.cgl.frameStore.perspective =
    {
        "fovy": fovY.get(),
        "zFar": zFar.get(),
        "zNear": zNear.get(),
    };
}
