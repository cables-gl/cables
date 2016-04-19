op.name='Multiply';

var number1=op.addInPort(new Port(op,"number1"));
var number2=op.addInPort(new Port(op,"number2"));
var result=op.addOutPort(new Port(op,"result"));

function update()
{
    var n1=parseFloat(number1.get());
    var n2=parseFloat(number2.get());

    if(isNaN(n1))n1=0;
    if(isNaN(n2))n2=0;

    result.set( n1*n2 );
}

number1.onValueChanged=update;
number2.onValueChanged=update;

number1.set(1);
number2.set(2);
