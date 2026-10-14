const
    num = op.inFloat("Number"),
    divisor = op.inFloat("Divisor"),
    result = op.outBoolNum("Result");

num.onChange = divisor.onChange = function ()
{
    result.set(num.get() % divisor.get() === 0);
};
