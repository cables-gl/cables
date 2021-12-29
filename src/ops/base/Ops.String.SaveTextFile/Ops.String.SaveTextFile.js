const
    download = op.inTriggerButton("Download"),
    filename = op.inString("Filename", "textfile.txt"),
    inStr = op.inString("Content String");

download.onTriggered = function ()
{
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(inStr.get());
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename.get() );
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
