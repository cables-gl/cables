const
    val = op.inFloat("Value"),
    result = op.outBoolNum("Result", true);

val.onChange = function ()
{
    result.set(val.get() == 0);
};
