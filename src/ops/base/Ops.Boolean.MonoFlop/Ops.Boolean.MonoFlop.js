
var trigger=op.inFunctionButton("Trigger");
var duration=op.inValue("Duration",1);

var result=op.outValue("Result",false);

var lastTimeout=-1;

trigger.onTriggered=function()
{
    result.set(true);
    
    clearTimeout(lastTimeout);
    lastTimeout=setTimeout(function()
    {
        result.set(false);
    },duration.get()*1000);

};