const
    number1 = op.inFloat("number1", 1),
    number2 = op.inFloat("number2", 1),
    result = op.outBoolNum("result");
op.setUiAttribs({ "mathTitle": true });

number1.onChange =
    number2.onChange = exec;
exec();

function exec()
{
    result.set(number1.get() == number2.get());
}
