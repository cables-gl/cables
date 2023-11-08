const
    v = op.inBool("value", false),
    result = op.outBoolNum("result");

result.set(false);
v.onChange = exec;

function exec()
{
    console.log(v.get());
    if (result.get() != v.get()) result.set(v.get());
}
