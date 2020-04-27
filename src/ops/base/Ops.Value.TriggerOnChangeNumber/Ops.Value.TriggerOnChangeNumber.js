const inval = op.inValue("Value");
const next = op.outTrigger("Next");
const number = op.outValue("Number");

inval.onChange = function ()
{
    number.set(inval.get());
    next.trigger();
};
