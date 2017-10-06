
op.name='sum';
var result=op.addOutPort(new Port(op,"result"));
var number1=op.addInPort(new Port(op,"number1"));
var number2=op.addInPort(new Port(op,"number2"));

function exec()
{
    var v=(number1.get())+number2.get();
    if(!isNaN(v)) result.set( v );
}

number1.onValueChanged=exec;
number2.onValueChanged=exec;

number1.set(1);
number2.set(1);
