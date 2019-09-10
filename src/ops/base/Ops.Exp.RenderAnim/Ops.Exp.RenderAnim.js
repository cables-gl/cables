const
    inFilename=op.inValueString("Filename","cables"),
    inFormat=op.inValueSelect("Fileformat",["webm","png"],"png"),
    inExec=op.inTriggerButton("Render"),

    inStart=op.inValue("Start Time",0),
    inEnd=op.inValue("End Time",1),
    inFps=op.inValue("FPS",30),

    inVpSize=op.inBool("Use Viewport Size",true),
    inWidth=op.inInt("Width",1280),
    inHeight=op.inInt("Height",720),

    outProgress=op.outValue("Progress"),
    outFinished=op.outTrigger("Finished");

op.setPortGroup("Size",[inVpSize,inWidth,inHeight]);
op.setPortGroup("Timing",[inStart,inEnd,inFps]);

const cgl=gui.patch().scene.cgl;

inVpSize.onChange=updateSizeInputs;
updateSizeInputs();

function updateSizeInputs()
{
    inHeight.setUiAttribs({greyout:inVpSize.get()});
    inWidth.setUiAttribs({greyout:inVpSize.get()});
}

inExec.onTriggered=function()
{
    if(!inVpSize.get())
    {
        if(window.gui)
        {
            window.gui.rendererWidth=Math.floor(inWidth.get());
            window.gui.rendererHeight=Math.floor(inHeight.get());
            window.gui.setLayout();
        }

        cgl.setSize(inWidth.get(),inHeight.get());
    }

    var seq=CABLES.UI.ImageSequenceExport(
        inFilename.get(),
        inStart.get(),
        inEnd.get(),
        inFps.get(),
        {
            format:inFormat.get(),
            onProgress:progress
        });
};

function progress(v)
{
    outProgress.set(v);
    if(v==1)
    {
        op.patch.resume();
        outFinished.trigger();
    }
}

