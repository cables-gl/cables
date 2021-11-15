const
    filename = op.inString("Filename", "cables"),
    useSize = op.inValueBool("Use Canvas Size", true),
    exe = op.inTriggerButton("Screenshot"),
    outNext = op.outTrigger("Finished"),
    width = op.inValueInt("Width", 0),
    height = op.inValueInt("Height", 0);

useSize.onChange = updateSizePorts;
const cgl = op.patch.cgl;
updateSizePorts();

exe.onTriggered = function ()
{
    const oldHeight = cgl.canvasHeight;
    const oldWidth = cgl.canvasWidth;

    if (!useSize.get())
    {
        op.patch.pause();
        op.patch.cgl.setSize(width.get() / op.patch.cgl.pixelDensity, height.get() / op.patch.cgl.pixelDensity);
        op.patch.renderOneFrame();
    }

    cgl.saveScreenshot(
        filename.get(),
        function ()
        {
            outNext.trigger();

            setTimeout(() =>
            {
                if (!useSize.get())
                {
                    op.patch.cgl.setSize(oldWidth / op.patch.cgl.pixelDensity, oldHeight / op.patch.cgl.pixelDensity);
                }
            }, 300);
            op.patch.resume();
        }
    );
};

function updateSizePorts()
{
    if (useSize.get())
    {
        width.setUiAttribs({ "hidePort": true, "greyout": true });
        height.setUiAttribs({ "hidePort": true, "greyout": true });
    }
    else
    {
        width.set(op.patch.cgl.canvasWidth);
        height.set(op.patch.cgl.canvasHeight);
        width.setUiAttribs({ "hidePort": false, "greyout": false });
        height.setUiAttribs({ "hidePort": false, "greyout": false });
    }
}
