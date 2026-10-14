const
    value = op.inFloat("value", 1),
    max = op.inFloat("Maximum", 1),
    result = op.outNumber("result");

max.onChange =
    value.onChange = exec;

exec();

function exec()
{
    let v = Math.max(value.get(), max.get());
    if (v == v) result.set(v);
}
