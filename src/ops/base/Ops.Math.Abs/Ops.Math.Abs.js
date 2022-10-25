const
    number = op.inValue("number"),
    result = op.outNumber("result");

number.onChange = function ()
{
    result.set(Math.abs(number.get()));
};
