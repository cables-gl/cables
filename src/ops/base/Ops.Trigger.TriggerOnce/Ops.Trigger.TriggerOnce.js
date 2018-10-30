
var exe=op.inTriggerButton("Exec");
var reset=op.inTriggerButton("Reset");
var next=op.outTrigger("Next");
var outTriggered=op.outValue("Was Triggered");
var triggered=false;

reset.onTriggered=function()
{
    triggered=false;
    outTriggered.set(triggered);
};

exe.onTriggered=function()
{
    if(triggered)return;

    triggered=true;
    next.trigger();
    outTriggered.set(triggered);

};