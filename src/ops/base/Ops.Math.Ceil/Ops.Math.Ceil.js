op.name='Ceil';
var number1=op.addInPort(new Port(op,"Number"));
var result=op.addOutPort(new Port(op,"Result"));

function exec()
{
    result.set(Math.ceil(number1.get()));
}

number1.onValueChanged=exec;
