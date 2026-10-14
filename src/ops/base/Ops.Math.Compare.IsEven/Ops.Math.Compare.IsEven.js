const
    number = op.inFloat("number1"),
    result = op.outBoolNum("result");

number.onChange = exec;
exec();

function exec()
{
    result.set(!(number.get() & 1));
}
