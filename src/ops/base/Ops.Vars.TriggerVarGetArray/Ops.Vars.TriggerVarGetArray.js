const
    exec = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    val = op.outArray("Value");

op.varName = op.inValueSelect("Variable", [], "", true);

const w = new CABLES.VarGetOpWrapper(op, "array", op.varName, null);

exec.onTriggered = () =>
{
    if (w && w.variable)
        val.set(w.variable.getValue());
    next.trigger();
};
