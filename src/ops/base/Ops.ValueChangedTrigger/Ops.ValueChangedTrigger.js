op.name="ValueChangedTrigger";

var val=op.addInPort(new Port(op,"Value"));
var exe=op.inFunction("Execute");
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));


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

