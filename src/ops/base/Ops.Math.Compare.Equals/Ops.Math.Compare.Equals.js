op.name='Equals';

var result = op.addOutPort(new Port(op,"result"));
var number1 = op.addInPort(new Port(op,"number1"));
var number2 = op.addInPort(new Port(op,"number2"));

number1.set(1);
number2.set(1);

function exec()
{
    result.set( number1.get() == number2.get() );
}

number1.onValueChanged = exec;
number2.onValueChanged = exec;
exec();
