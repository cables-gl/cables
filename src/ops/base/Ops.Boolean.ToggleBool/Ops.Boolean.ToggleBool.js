const
    trigger=op.inTriggerButton("trigger"),
    reset=op.inTriggerButton("reset"),
    outBool=op.outValue("result");

var theBool=false;
outBool.set(theBool);
outBool.ignoreValueSerialize=true;

trigger.onTriggered=function()
{
    theBool=!theBool;
    outBool.set(theBool);
};

reset.onTriggered=function()
{
    theBool=false;
    outBool.set(theBool);
};

