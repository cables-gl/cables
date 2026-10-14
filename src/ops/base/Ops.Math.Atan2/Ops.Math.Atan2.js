const
    x = op.inFloat("X"),
    y = op.inFloat("Y"),
    phase = op.inFloat("Phase", 0.0),
    mul = op.inFloat("Frequency", 1.0),
    result = op.outNumber("Result");

x.onChange =
    y.onChange = update;

function update()
{
    result.set(
        mul.get() * Math.atan2(x.get(), y.get()) + phase.get()
    );
}
