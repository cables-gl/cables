const val=op.inValueFloat("Value");
const trigger=op.outTrigger('Trigger');

val.onChange=function()
{
    trigger.trigger();
};

