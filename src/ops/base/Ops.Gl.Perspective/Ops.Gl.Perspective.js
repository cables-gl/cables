const
    render = op.inTrigger("render"),
    inAxis = op.inSwitch("Axis", ["Vertical", "Horizontal"], "Vertical"),
    fovY = op.inValueFloat("fov y", 45),
    zNear = op.inValueFloat("frustum near", 0.1),
    zFar = op.inValueFloat("frustum far", 20),
    autoAspect = op.inValueBool("Auto Aspect Ratio", true),
    aspect = op.inValue("Aspect Ratio"),
    trigger = op.outTrigger("trigger"),
    outAsp = op.outNumber("Aspect");

fovY.onChange = zFar.onChange = zNear.onChange = changed;
fovY.setUiAttribs({ "title": "FOV Degrees" });

op.setPortGroup("Field of View", [fovY]);
op.setPortGroup("Frustrum", [zNear, zFar]);

let asp = 0;
let axis = 0;

changed();

inAxis.onChange = () =>
{
    axis = 0;
    if (inAxis.get() == "Horizontal")axis = 1;
};

render.onTriggered = function ()
{
    const cg = op.patch.cg;
    if (!cg) return;

    asp = cg.getViewPort()[2] / cg.getViewPort()[3];
    if (!autoAspect.get())asp = aspect.get();
    outAsp.set(asp);

    cg.pushPMatrix();

    if (axis == 0)
        mat4.perspective(cg.pMatrix, fovY.get() * 0.0174533, asp, zNear.get(), zFar.get());
    else
        perspectiveFovX(cg.pMatrix, fovY.get() * 0.0174533, asp, zNear.get(), zFar.get());

    trigger.trigger();

    cg.popPMatrix();
};

function changed()
{
    op.patch.cgl.tempData.perspective =
    {
        "fovy": fovY.get(),
        "zFar": zFar.get(),
        "zNear": zNear.get(),
    };
}

function perspectiveFovX(out, fovx, aspect, near, far)
{
    let nf;
    let f = 1 / (fovx) * 2;
    // Math.tan(1 / fovx * 2),
    // f=Math.max(0,f);

    out[0] = f;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f / (1.0 / aspect);
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far != null && far !== Infinity)
    {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
    }
    else
    {
        out[10] = -1;
        out[14] = -2 * near;
    }
    return out;
}
