
const
    download = op.inTriggerButton("download"),
    filename = op.inString("Filename", "jsonexport"),
    inObject = op.inObject("Object");

download.onTriggered = function ()
{
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inObject.get(), null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename.get() + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
