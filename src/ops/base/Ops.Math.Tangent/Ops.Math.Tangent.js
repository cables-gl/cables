const
    value = op.inValue("Value"),
    phase = op.inValue("Phase", 0.0),
    mul = op.inValue("Frequency", 1.0),
    amplitude = op.inValue("Amplitude", 1.0),
    invert = op.inValueBool("asine", false),
    result = op.outNumber("Result");

let calculate = Math.tan;

value.onChange = function ()
{
    result.set(
        amplitude.get() * calculate((value.get() * mul.get()) + phase.get())
    );
};

invert.onChange = function ()
{
    if (invert.get()) calculate = Math.atan;
    else calculate = Math.tan;
};
