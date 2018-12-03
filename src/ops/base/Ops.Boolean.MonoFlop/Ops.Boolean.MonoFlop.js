const
    trigger=op.inTriggerButton("Trigger"),
    duration=op.inValue("Duration",1),
    valueTrue=op.inValue("Value True",1),
    valueFalse=op.inValue("Value False",0),
    result=op.outValue("Result",false);

var lastTimeout=-1;

trigger.onTriggered=function()
{
    result.set(valueTrue.get());

    clearTimeout(lastTimeout);
    lastTimeout=setTimeout(function()
    {
        result.set(valueFalse.get());
    },duration.get()*1000);

};