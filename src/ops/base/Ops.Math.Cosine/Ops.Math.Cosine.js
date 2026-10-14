const
    value = op.inFloat("Value"),
    phase = op.inFloat("Phase", 0.0),
    mul = op.inFloat("Frequency", 1.0),
    amplitude = op.inFloat("Amplitude", 1.0),
    invert = op.inBool("asine", false),
    result = op.outNumber("Result");

let calculate = Math.cos;

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
    if (invert.get()) calculate = Math.acos;
    else calculate = Math.cos;
};
