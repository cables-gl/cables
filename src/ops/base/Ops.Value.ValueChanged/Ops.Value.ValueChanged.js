op.name="ValueChanged";

var val=op.addInPort(new Port(op,"Value"));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

val.onChange=function()
{
    trigger.trigger();
};

