const
    number1 = op.inValue("number1", 1),
    number2 = op.inValue("number2", 1),
    result = op.outBoolNum("result");

number1.onChange =
    number2.onChange = exec;
exec();

function exec()
{
    result.set(number1.get() == number2.get());
}
