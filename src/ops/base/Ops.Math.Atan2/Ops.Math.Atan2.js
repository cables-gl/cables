const
    x = op.inValue("X"),
    y = op.inValue("Y"),
    phase = op.inValue("Phase", 0.0),
    mul = op.inValue("Frequency", 1.0),
    result = op.outNumber("Result");

x.onChange =
    y.onChange = update;

function update()
{
    result.set(
        mul.get() * Math.atan2(x.get(), y.get()) + phase.get()
    );
}
