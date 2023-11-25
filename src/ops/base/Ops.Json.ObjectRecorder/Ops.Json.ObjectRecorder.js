const
    exec = op.inTriggerButton("Exec"),
    reset = op.inTriggerButton("reset"),
    download = op.inTriggerButton("download"),
    inObj = op.inObject("Object"),
    outArr = op.outArray("Result"),
    numObjects = op.outNumber("Num Objects");
let data = [];

reset.onTriggered = function ()
{
    data.length = 0;
    numObjects.set(data.length);
};

exec.onTriggered = function ()
{
    if (inObj.get()) data.push(JSON.parse(JSON.stringify(inObj.get())));
    numObjects.set(data.length);
    outArr.setRef(data);
};
download.onTriggered = function ()
{
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    let downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "jsonexport.json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};
