const
    inNum = op.inFloat("Number", 0),
    inOr = op.inFloat("Or", 1),
    result = op.outNumber("Result");

inNum.onChange =
inOr.onChange = update;
update();

function update()
{
    if (!inNum.get())result.set(inOr.get());
    else result.set(inNum.get());
}
