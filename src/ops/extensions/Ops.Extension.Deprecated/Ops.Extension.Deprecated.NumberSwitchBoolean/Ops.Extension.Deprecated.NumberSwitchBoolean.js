const
    inBool = op.inValueBool("Boolean"),
    valFalse = op.inFloat("Value false", 0),
    valTrue = op.inFloat("Value true", 1),
    outVal = op.outNumber("Result");

inBool.onChange =
    valTrue.onChange =
    valFalse.onChange = update;

op.setPortGroup("Output Values", [valTrue, valFalse]);

function update()
{
    if (inBool.get()) outVal.set(valTrue.get());
    else outVal.set(valFalse.get());
}
