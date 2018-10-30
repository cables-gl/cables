
var input=op.addInPort(new CABLES.Port(op,"input"));
var result=op.addOutPort(new CABLES.Port(op,"result"));

function update()
{
    result.set( typeof(input.get()) );
}


input.onChange=update;

