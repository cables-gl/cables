const
    number = op.inFloat("number"),
    smooth = op.inFloatSlider("Smooth", 0.8),
    result = op.outNumber("result");

let hasValue = false;

number.onChange = function ()
{
    const value = number.get();

    if (!hasValue)
    {
        hasValue = true;
        result.set(value);
        return;
    }

    const amount = smooth.get();
    result.set(result.get() * amount + value * (1.0 - amount));
};
