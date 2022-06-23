// http://stackoverflow.com/questions/5504635/computing-fovx-opengl

const render = op.inTrigger("render");
const fovY = op.inValueFloat("fov y", 45);
const zNear = op.inValueFloat("frustum near", 0.1);
const zFar = op.inValueFloat("frustum far", 20);
const autoAspect = op.inValueBool("Auto Aspect Ratio", true);
const aspect = op.inValue("Aspect Ratio");

const trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;

fovY.onChange = zFar.onChange = zNear.onChange = changed;

changed();

op.setPortGroup("Field of View", fovY);
op.setPortGroup("Frustrum", zNear, zFar);

let asp = 0;

render.onTriggered = function ()
{
    asp = cgl.getViewPort()[2] / cgl.getViewPort()[3];
    if (!autoAspect.get())asp = aspect.get();

    cgl.pushPMatrix();
    mat4.perspective(
        cgl.pMatrix,
        fovY.get() * 0.0174533,
        asp,
        zNear.get(),
        zFar.get());

    // mat4.translate(cgl.pMatrix,cgl.pMatrix,[-0.5,0,0]);
    trigger.trigger();

    cgl.popPMatrix();
};

function changed()
{
    cgl.frameStore.perspective =
    {
        "fovy": fovY.get(),
        "zFar": zFar.get(),
        "zNear": zNear.get(),
    };
}
