const
    render = op.inTrigger("render"),
    bounds = op.inValue("bounds", 2),
    fixAxis = op.inSwitch("Axis", ["X", "Y", "None"], "X"),
    zNear = op.inValue("frustum near", -100),
    zFar = op.inValue("frustum far", 100),
    trigger = op.outTrigger("trigger"),
    outRatio = op.outNumber("Ratio"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height");
const cgl = op.patch.cgl;

render.onTriggered = function ()
{
    const vp = cgl.getViewPort();

    if (fixAxis.get() == "X")
    {
        const ratio = vp[3] / vp[2];

        cgl.pushPMatrix();
        mat4.ortho(
            cgl.pMatrix,
            -bounds.get(),
            bounds.get(),
            -bounds.get() * ratio,
            bounds.get() * ratio,
            parseFloat(zNear.get()),
            parseFloat(zFar.get())
        );

        outWidth.set(bounds.get() * 2);
        outHeight.set(bounds.get() * ratio * 2);
        outRatio.set(ratio);
    }
    else if (fixAxis.get() == "Y")
    {
        const ratio = vp[2] / vp[3];

        cgl.pushPMatrix();
        mat4.ortho(
            cgl.pMatrix,
            -bounds.get() * ratio,
            bounds.get() * ratio,
            -bounds.get(),
            bounds.get(),
            parseFloat(zNear.get()),
            parseFloat(zFar.get())
        );

        outWidth.set(bounds.get() * ratio * 2);
        outHeight.set(bounds.get() * 2);
        outRatio.set(ratio);
    }
    else
    {
        cgl.pushPMatrix();
        mat4.ortho(
            cgl.pMatrix,
            -bounds.get(),
            bounds.get(),
            -bounds.get(),
            bounds.get(),
            parseFloat(zNear.get()),
            parseFloat(zFar.get())
        );

        outWidth.set(bounds.get() * 2);
        outHeight.set(bounds.get() * 2);
        outRatio.set(1);
    }

    trigger.trigger();
    cgl.popPMatrix();
};
