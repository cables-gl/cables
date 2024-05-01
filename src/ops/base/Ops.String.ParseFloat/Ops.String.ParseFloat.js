const
    str = op.inString("String", 0),
    outNum = op.outNumber("Number");

str.onChange = function ()
{
    let num = parseFloat(str.get());
    if (num != num) num = 0;
    outNum.set(num);
};
