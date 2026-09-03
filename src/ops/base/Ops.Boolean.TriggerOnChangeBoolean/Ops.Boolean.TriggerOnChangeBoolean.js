const
    inBool = op.inBool("Value"),
    outTrue = op.outTrigger("True"),
    outFalse = op.outTrigger("False");

inBool.onChange = function ()
{
    if (inBool.get()) outTrue.trigger();
    else outFalse.trigger();
};
