const
    num1 = op.inValue("Number A"),
    num2 = op.inValue("Number B"),
    result = op.outNumber("Result");

num1.onChange =
    num2.onChange = update;

function update()
{
    let r = num1.get() - num2.get();
    r = Math.abs(r);
    result.set(r);
}
