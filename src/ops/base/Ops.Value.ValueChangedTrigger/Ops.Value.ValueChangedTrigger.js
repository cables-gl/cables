var val=op.addInPort(new CABLES.Port(op,"Value"));
var exe=op.inTrigger("Execute");
var trigger=op.addOutPort(new CABLES.Port(op,"Trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var changed=false;

exe.onTriggered=function()
{
    if(changed)
    {
        changed=false;
        trigger.trigger();
    }
};

val.onValueChanged=function()
{
    changed=true;
};

