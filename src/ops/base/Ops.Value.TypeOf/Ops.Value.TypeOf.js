
var input=op.addInPort(new CABLES.Port(op,"input"));
const result=op.outValue("result");

function update()
{
    result.set( typeof(input.get()) );
}


input.onChange=update;

