op.name="TriggerOnce";


var exe=op.inFunction("Exec");
var reset=op.outFunction("Reset");
var next=op.inFunctionButton("Next");

var triggered=false;

reset.onTriggered=function()
{
    triggered=false;
};

exe.onTriggered=function()
{
    if(triggered)return;

    triggered=true;
    next.trigger();

};