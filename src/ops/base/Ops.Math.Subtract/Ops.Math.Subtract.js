var number1=op.addInPort(new CABLES.Port(op,"number1"));
var number2=op.addInPort(new CABLES.Port(op,"number2"));
var result=op.addOutPort(new CABLES.Port(op,"result"));

number1.onValueChanged=exec;
number2.onValueChanged=exec;

number1.set(1);
number2.set(1);


function exec()
{
    var v=number1.get()-number2.get();
    if(!isNaN(v)) result.set( v );
}

