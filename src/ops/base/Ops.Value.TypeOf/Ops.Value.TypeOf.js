
var input=op.addInPort(new Port(op,"input"));
var result=op.addOutPort(new Port(op,"result"));

function update()
{
    result.set( typeof(input.get()) );
}


input.onValueChanged=update;

