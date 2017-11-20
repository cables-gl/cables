op.name="TriggerOnce";


var exe=op.inFunction("Exec");
var reset=op.inFunctionButton("Reset");
var next=op.outFunction("Next");
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