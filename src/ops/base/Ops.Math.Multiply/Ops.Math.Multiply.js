op.name='Multiply';

var number1=op.addInPort(new Port(op,"number1"));
var number2=op.addInPort(new Port(op,"number2"));
var result=op.addOutPort(new Port(op,"result"));

var update=function()
{
    result.set( number1.get()*number2.get()*1 );
};

number1.onValueChange(update);
number2.onValueChange(update);

number1.set(1);
number2.set(2);
