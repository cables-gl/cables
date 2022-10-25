const
    val = op.inValue("Value"),
    result = op.outBoolNum("Result", true);

val.onChange = function ()
{
    result.set(val.get() == 0);
};
