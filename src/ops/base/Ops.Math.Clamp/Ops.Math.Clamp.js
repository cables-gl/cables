const
    val = op.inFloat("val", 0.5),
    min = op.inFloat("min", 0),
    max = op.inFloat("max", 1),
    ignore = op.inBool("ignore outside values"),
    result = op.outNumber("result");

val.onChange = min.onChange = max.onChange = clamp;

function clamp()
{
    if (ignore.get())
    {
        if (val.get() > max.get()) return;
        if (val.get() < min.get()) return;
    }
    result.set(Math.min(Math.max(val.get(), min.get()), max.get()));
}
