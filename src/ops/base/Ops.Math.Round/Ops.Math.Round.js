op.name='Round';
var result=op.addOutPort(new Port(op,"result"));
var number1=op.addInPort(new Port(op,"number"));

function exec()
{
    result.set(Math.round(number1.get()));
}

number1.onValueChanged=exec;
