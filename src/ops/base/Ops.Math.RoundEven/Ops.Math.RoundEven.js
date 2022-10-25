const
    inNum = op.inValueFloat("Number"),
    inMode = op.inSwitch("Mode", ["Ceil", "Floor"], "Ceil"),
    result = op.outNumber("Result");

inMode.onChange = inNum.onChange = function ()
{
    let value = 0;
    switch (inMode.get())
    {
    case "Floor":
        value = 2 * (Math.floor(inNum.get() / 2.0));
        break;
    default:
    case "Ceil":
        value = 2 * (Math.round(inNum.get() / 2.0));
        break;
    }
    result.set(value);
};
