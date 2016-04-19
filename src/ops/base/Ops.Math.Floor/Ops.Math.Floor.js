op.name='Floor';
var result=op.addOutPort(new Port(op,"Result"));
var number1=op.addInPort(new Port(op,"Number"));

function exec()
{
    result.set(Math.floor(number1.get()));
}

number1.onValueChanged=exec;
