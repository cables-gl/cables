op.name='Between';

var result=op.addOutPort(new Port(op,"result"));
var number=op.addInPort(new Port(op,"value"));
var number1=op.addInPort(new Port(op,"number1"));
var number2=op.addInPort(new Port(op,"number2"));

number.set(2.0);
number1.set(1.0);
number2.set(3.0);

exec= function()
{
    result.set
        (
            number.get() > Math.min(number1.get() , number2.get() )  &&
            number.get() < Math.max(number1.get() , number2.get() ) 
        );
};

number1.onValueChanged=exec;
number2.onValueChanged=exec;
number.onValueChanged=exec;
exec();