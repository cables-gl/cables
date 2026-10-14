const
    value = op.inFloat("Value"),
    result = op.outNumber("Result");

value.onChange = function ()
{
    const v = value.get();
    result.set(v - Math.floor(v));
};
