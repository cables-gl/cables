const val = op.inFloat("Value");
const trigger = op.outTrigger("Trigger");

val.onChange = function ()
{
    trigger.trigger();
};
