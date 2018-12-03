var val=op.addInPort(new CABLES.Port(op,"Value"));
var trigger=op.outTrigger('Trigger');


val.onChange=function()
{
    trigger.trigger();

};

