const
    val = op.inFloat("Value"),
    result = op.outBoolNum("Result", false);

val.onChange = function ()
{
    result.set(val.get() == 1);
};
