const
    str = op.inString("String", 5711),
    outNum = op.outNumber("Number");

str.onChange = function ()
{
    let num = parseInt(str.get());
    if (num != num) num = 0;
    outNum.set(num);
};
