let inBool = op.inBool("Value");
let outTrue = op.outTrigger("True");
let outFalse = op.outTrigger("False");

inBool.onChange = function ()
{
    if (inBool.get()) outTrue.trigger();
    else outFalse.trigger();
};
