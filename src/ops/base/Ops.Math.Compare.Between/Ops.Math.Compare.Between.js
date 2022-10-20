const
    number = op.inValue("value", 2),
    number1 = op.inValue("number1", 1),
    number2 = op.inValue("number2", 3),
    result = op.outNumber("result");

number1.onChange = exec;
number2.onChange = exec;
number.onChange = exec;
exec();

function exec()
{
    result.set(
        number.get() > Math.min(number1.get(), number2.get()) &&
            number.get() < Math.max(number1.get(), number2.get())
    );
}
