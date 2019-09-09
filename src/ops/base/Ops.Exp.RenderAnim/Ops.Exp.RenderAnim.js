
var inFilename=op.inValueString("Filename","cables");
var inStart=op.inValue("Start Time",0);
var inEnd=op.inValue("End Time",1);
var inFps=op.inValue("FPS",30);
var inFormat=op.inValueSelect("Fileformat",["webm","png"],"png");
var inExec=op.inTriggerButton("Render");

var outProgress=op.outValue("Progress");
var outFinished=op.outTrigger("Finished");

inExec.onTriggered=function()
{
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