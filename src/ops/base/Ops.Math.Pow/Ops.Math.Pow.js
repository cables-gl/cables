const
    base = op.inValueFloat("Base"),
    exponent = op.inValueFloat("Exponent"),
    result = op.outNumber("Result");

exponent.set(2);

base.onChange = update;
exponent.onChange = update;

function update()
{
    let r = Math.pow(base.get(), exponent.get());
    if (isNaN(r))r = 0;
    result.set(r);
}
