const
    filename = op.inString("Filename", "cables"),
    exe = op.inTriggerButton("Screenshot"),
    outNext = op.outTrigger("Finished");


const cgl = op.patch.cgl;

exe.onTriggered = function ()
{
    cgl.saveScreenshot(
        filename.get(),
        function ()
        {
            outNext.trigger();

            op.patch.resume();
        }
    );
};

