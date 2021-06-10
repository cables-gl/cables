const
    val1 = op.inFloat("Value 1"),
    val2 = op.inFloat("Value 2"),
    perc = op.inFloatSlider("Percentage"),
    result = op.outNumber("Result");

val1.onChange =
val2.onChange =
perc.onChange = update;

function update()
{
    result.set((val2.get() - val1.get()) * perc.get() + val1.get());
}
