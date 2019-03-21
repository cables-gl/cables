const
    inVal=op.inValueFloat("Number"),
    result=op.outValue("Result");

inVal.onChange=update;

function update()
{
    result.set(inVal.get()*-1);
}
