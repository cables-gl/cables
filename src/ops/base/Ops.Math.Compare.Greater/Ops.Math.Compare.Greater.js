op.name='Greater';
var result=op.addOutPort(new CABLES.Port(op,"result"));
var number1=op.addInPort(new CABLES.Port(op,"number1"));
var number2=op.addInPort(new CABLES.Port(op,"number2"));

function exec()
{
    result.set(number1.get()>number2.get());
}

number1.onValueChanged=exec;
number2.onValueChanged=exec;
