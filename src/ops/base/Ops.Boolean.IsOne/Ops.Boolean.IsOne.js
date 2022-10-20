const
    val = op.inValue("Value"),
    result = op.outBoolNum("Result", false);

val.onChange = function ()
{
    result.set(val.get() == 1);
};
