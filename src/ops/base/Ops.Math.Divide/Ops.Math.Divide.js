const
    number1 = op.inValueFloat("number1",1),
    number2 = op.inValueFloat("number2",1),
    result = op.outValue("result");

number1.onChange=number2.onChange=exec;
exec();

function exec()
{
    result.set( number1.get() / number2.get() );
}

