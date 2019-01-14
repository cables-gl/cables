
const
    inval=op.inValueFloat("Value",-1),
    result=op.outValue("Result");

inval.onChange=update;

function update()
{
    result.set(inval.get()*-1);
}