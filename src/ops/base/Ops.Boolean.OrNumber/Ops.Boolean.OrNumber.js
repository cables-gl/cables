const
    inNum = op.inFloat("Number", 0),
    inOr = op.inFloat("Or", 1),
    result = op.outNumber("Result");

inNum.onChange =
inOr.onChange = update;
update();

function update()
{
    const n = inNum.get();
    if (!n || n != n)result.set(inOr.get());
    else result.set(inNum.get());
}
