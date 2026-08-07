const
    value = op.inFloat("value"),
    phase = op.inFloat("phase", 0.0),
    mul = op.inFloat("frequency", 1.0),
    amplitude = op.inFloat("amplitude", 1.0),
    invert = op.inBool("asine", false),
    result = op.outNumber("result");

let calculate = Math.sin;

mul.onChange =
    amplitude.onChange =
    phase.onChange =
    value.onChange = function ()
    {
        result.set(
            amplitude.get() * calculate((value.get() * mul.get()) + phase.get())
        );
    };

invert.onChange = function ()
{
    if (invert.get()) calculate = Math.asin;
    else calculate = Math.sin;
};
