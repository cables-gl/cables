
var inExec=op.inFunctionButton("Render");
var inFilename=op.inValue("Filename","cables");
var inStart=op.inValue("Start Time",0);
var inEnd=op.inValue("End Time",1);
var inFps=op.inValue("FPS",30);
var inFormat=op.inValueSelect("Fileformat",["webm","png"],"webm");

inExec.onTriggered=function()
{
    var seq=CABLES.UI.ImageSequenceExport(
        inFilename.get()+'.'+inFormat.get(),
        inStart.get(),
        inEnd.get(),
        inFps.get(),
        {
            format:inFormat.get()
        });
};

