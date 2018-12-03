

var exec=op.inTriggerButton("Exec");
var reset=op.inTriggerButton("reset");
var download=op.inTriggerButton("download");


var inObj=op.inObject("Object");
var numObjects=op.outValue("Num Objects");

var data=[];

reset.onTriggered=function()
{
    data.length=0;
    numObjects.set(data.length);
};



exec.onTriggered=function()
{
    if(inObj.get()) data.push(JSON.parse(JSON.stringify(inObj.get())));
    numObjects.set(data.length);
    
};
download.onTriggered=function()
{

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "jsonexport.json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

};
