const
    inBool = op.inValueBool("Value"),
    outTrue = op.outTrigger("True"),
    outFalse = op.outTrigger("False");

inBool.onChange = update;

function update()
{
    if (inBool.get()) outTrue.trigger();
    else outFalse.trigger();
}

op.init = () =>
{
    if (inBool.isLinked())update();
};
