
const download = op.inTriggerButton("download");
const filename = op.inValueString("Filename", "jsonexport");
const inObject = op.inObject("Object");

download.onTriggered = function ()
{
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inObject.get(), null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename.get() + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
