const
    value = op.inValue("Value"),
    result = op.outNumber("Result");

value.onChange = function ()
{
    const v = value.get();
    result.set(v - Math.floor(v));
};
