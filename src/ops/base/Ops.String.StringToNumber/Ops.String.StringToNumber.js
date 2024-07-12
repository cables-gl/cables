const
    str = op.inString("String", 0),
    outNum = op.outNumber("Number"),
    outNaN = op.outBoolNum("Not a number", false);

str.onChange = function ()
{
    outNaN.set(false);
    let num = parseFloat(str.get());
    if (num != num)
    {
        num = 0;
        outNaN.set(true);
    }

    outNum.set(num);
};
