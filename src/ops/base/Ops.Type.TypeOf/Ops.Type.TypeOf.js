op.name="TypeOf";

var number=op.addInPort(new Port(op,"number1"));
var result=op.addOutPort(new Port(op,"result"));

function update()
{
    result.set( typeof(number.get()) );
}

number.onValueChanged=update;

