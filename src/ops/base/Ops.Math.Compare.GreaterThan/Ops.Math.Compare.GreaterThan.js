const
    result=op.outValue("result"),
    number1=op.inValueFloat("number1"),
    number2=op.inValueFloat("number2");

number1.onChange=number2.onChange=exec;

function exec()
{
    result.set(number1.get()>number2.get());
}

