const
    result = op.outValue("result"),
    number = op.inFloat("number", 0),
    min = op.inFloat("min", 0),
    max = op.inFloat("max", 1);

number.onChange = max.onChange = min.onChange = exec;
exec();

function exec()
{
    // todo negative min ?

    let x = Math.max(0, Math.min(1, (number.get() - min.get()) / (max.get() - min.get())));
    result.set(x * x * (3 - 2 * x)); // smoothstep
}
