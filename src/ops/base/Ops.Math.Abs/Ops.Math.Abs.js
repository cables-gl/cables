const
    number = op.inFloat("number"),
    result = op.outNumber("result");

number.onChange = function ()
{
    result.set(Math.abs(number.get()));
};
