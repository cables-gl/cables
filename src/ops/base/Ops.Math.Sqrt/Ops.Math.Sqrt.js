const
    number = op.inFloat("number"),
    result = op.outNumber("result");

number.onChange = function ()
{
    let r = Math.sqrt(number.get());
    if (isNaN(r))r = 0;
    result.set(r);
};
