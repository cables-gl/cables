op.name="ValueChanged";

var val=op.addInPort(new Port(op,"Value"));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

val.onValueChanged=function()
{
    trigger.trigger();
};

