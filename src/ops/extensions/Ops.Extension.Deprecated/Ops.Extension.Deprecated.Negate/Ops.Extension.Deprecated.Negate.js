const
    inVal = op.inFloat("Number"),
    result = op.outNumber("Result");

inVal.onChange = update;

function update()
{
    result.set(inVal.get() * -1);
}
