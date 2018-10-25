var val=op.addInPort(new CABLES.Port(op,"Value"));
var trigger=op.addOutPort(new CABLES.Port(op,"Trigger",CABLES.OP_PORT_TYPE_FUNCTION));


val.onChange=function()
{
    trigger.trigger();

};

