op.name='Floor';
var result=op.addOutPort(new CABLES.Port(op,"Result"));
var number1=op.addInPort(new CABLES.Port(op,"Number"));

function exec()
{
    result.set(Math.floor(number1.get()));
}

number1.onValueChanged=exec;
