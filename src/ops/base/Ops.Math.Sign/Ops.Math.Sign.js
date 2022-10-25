const
    value = op.inValue("Value"),
    noZeroIn = op.inBool("Remove zero", false),
    result = op.outNumber("Result");

value.onChange = function ()
{
    let direction = 0;
    let val = value.get() * 999;
    let noZero = noZeroIn.get();

    if (!noZero)
    {
        direction = Math.round(Math.max(Math.min(val, 1), -1));
    }
    else
    {
        direction = (val < 0) ? -1 : 1;
    }
    result.set(direction);
};
