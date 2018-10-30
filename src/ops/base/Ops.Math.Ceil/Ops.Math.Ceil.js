op.name='Ceil';
var number1=op.addInPort(new CABLES.Port(op,"Number"));
var result=op.addOutPort(new CABLES.Port(op,"Result"));

function exec()
{
    result.set(Math.ceil(number1.get()));
}

number1.onChange=exec;
