var val=op.addInPort(new CABLES.Port(op,"Value"));
var trigger=op.outTrigger('trigger');


val.onChange=function()
{
    trigger.trigger();

};

