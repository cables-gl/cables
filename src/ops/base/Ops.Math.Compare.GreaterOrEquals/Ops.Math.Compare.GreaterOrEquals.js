const
    result = op.outBoolNum("result"),
    number1 = op.inFloat("number1"),
    number2 = op.inFloat("number2");

number1.onLinkChanged =
    number2.onLinkChanged =
    number1.onChange =
    number2.onChange = exec;

function exec()
{
    result.set(number1.get() >= number2.get());
}
