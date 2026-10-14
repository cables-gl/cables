const
    num1 = op.inFloat("Number A"),
    num2 = op.inFloat("Number B"),
    result = op.outNumber("Result");

num1.onChange =
    num2.onChange = update;

function update()
{
    let r = num1.get() - num2.get();
    r = Math.abs(r);
    result.set(r);
}
