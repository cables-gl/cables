const
    val1 = op.inValue("Value 1", 1),
    val2 = op.inValue("Value 2", 2),
    result = op.outNumber("result");

val1.onChange =
    val2.onChange = exec;

exec();

function exec()
{
    let v = Math.min(val1.get(), val2.get());
    result.set(v);
}
