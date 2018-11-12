var val=op.addInPort(new CABLES.Port(op,"Value"));
var exe=op.inTrigger("Execute");
var trigger=op.outTrigger('trigger');

var changed=false;

exe.onTriggered=function()
{
    if(changed)
    {
        changed=false;
        trigger.trigger();
    }
};

val.onChange=function()
{
    changed=true;
};

