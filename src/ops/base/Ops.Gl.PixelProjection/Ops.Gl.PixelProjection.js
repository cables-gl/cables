const
    render = op.inTrigger("render"),
    useVPSize = op.inBool("use viewport size", true),
    width = op.inValue("Width", 500),
    height = op.inValue("Height", 500),
    zNear = op.inValue("frustum near", -500),
    zFar = op.inValue("frustum far", 500),
    fixAxis = op.inSwitch("Axis", ["X", "Y"], "X"),

    flipX = op.inBool("Flip X", false),
    flipY = op.inBool("Flip Y", false),
    zeroY = op.inBool("Zero Y", false),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;

op.setPortGroup("Canvas size", [useVPSize, width, height]);
op.setPortGroup("Clipping", [zNear, zFar]);
op.setPortGroup("Flip", [flipX, flipY]);
op.toWorkPortsNeedToBeLinked(render);

render.onTriggered = exec;
useVPSize.onChange = updateSizeUI;
updateSizeUI();

function updateSizeUI()
{
    width.setUiAttribs({ "greyout": useVPSize.get() });
    height.setUiAttribs({ "greyout": useVPSize.get() });
}

function exec()
{
    let xl = 0;
    let yt = 0;
    let xr = 0;
    let yb = 0;

    if (useVPSize.get())
    {
        xr = cgl.getViewPort()[2] / cgl.pixelDensity;
        yb = cgl.getViewPort()[3] / cgl.pixelDensity;
    }
    else
    {
        xr = width.get();
        yb = height.get();
    }

    if (flipX.get())
    {
        const temp = xr;
        xr = 0;
        xl = temp;
    }

    if (flipY.get())
    {
        const temp = yb;
        yb = 0;
        yt = temp;
    }

    cgl.pushPMatrix();

    mat4.ortho(
        cgl.pMatrix,
        xl,
        xr,
        yt,
        yb,
        parseFloat(zNear.get()),
        parseFloat(zFar.get())
    );

    trigger.trigger();
    cgl.popPMatrix();
}
