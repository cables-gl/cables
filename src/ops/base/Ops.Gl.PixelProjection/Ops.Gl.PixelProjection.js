const
    render = op.inTrigger("render"),
    useVPSize = op.inBool("use viewport size", true), // call "canvas resolution" in next version..."
    width = op.inFloat("Width", 500),
    height = op.inFloat("Height", 500),
    zNear = op.inFloat("frustum near", -500),
    zFar = op.inFloat("frustum far", 500),
    // fixAxis = op.inSwitch("Axis", ["X", "Y"], "X"),
    inAlign = op.inSwitch("Position 0,0", ["Top Left", "Top Right", "Center", "Bottom Right", "Bottom Left"], "Bottom Left"),

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

    let w = width.get();
    let h = height.get();

    let x0 = 0;
    let y0 = 0;

    if (useVPSize.get())
    {
        xr = cgl.getViewPort()[2] / cgl.pixelDensity;
        yb = cgl.getViewPort()[3] / cgl.pixelDensity;
        w = cgl.getViewPort()[2] / cgl.pixelDensity;
        h = cgl.getViewPort()[3] / cgl.pixelDensity;
    }
    else
    {
        xr = w;
        yb = h;
    }

    if (flipX.get())
    {
        const temp = xr;
        xr = x0;
        xl = temp;
    }

    if (flipY.get())
    {
        const temp = yb;
        yb = y0;
        yt = temp;
    }

    if (inAlign.get() === "Center")
    {
        xl -= w / 2;
        xr -= w / 2;
        yt -= h / 2;
        yb -= h / 2;
    }
    else
    if (inAlign.get() === "Bottom Right")
    {
        xl -= w;
        xr = x0;
        yt = y0;
        yb = -h;
    }
    else
    if (inAlign.get() === "Top Right")
    {
        xl -= w;
        xr = x0;
        yt -= h;
        yb = y0;
    }
    if (inAlign.get() === "Top Left ")
    {
        xl = x0;
        xr = w;
        yt = -h;
        yb = y0;
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
