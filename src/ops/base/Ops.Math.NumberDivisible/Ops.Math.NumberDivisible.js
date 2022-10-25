const
    num = op.inValue("Number"),
    divisor = op.inValue("Divisor"),
    result = op.outBoolNum("Result");

num.onChange = divisor.onChange = function ()
{
    result.set(num.get() % divisor.get() === 0);
};
