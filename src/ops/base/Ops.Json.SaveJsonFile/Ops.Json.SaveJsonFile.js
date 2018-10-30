
var download=op.inTriggerButton("download");
var filename=op.inValueString("Filename","jsonexport");
var inObject=op.inObject("Object");

download.onTriggered=function()
{

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inObject.get()));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", filename.get()+".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

};
