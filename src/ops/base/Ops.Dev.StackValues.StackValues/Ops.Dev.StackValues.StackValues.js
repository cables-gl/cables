const
    inExec = op.inTrigger("Exec"),
    inStack = op.inBool("Show stack", false),
    outObj = op.outObject("Values");

inExec.onTriggered = () =>
{
    if (inStack.get())
    {
        outObj.setRef(op.patch.stackValues);
    }
    else
    {
        const o = {};

        for (const i in op.patch.stackValues)
        {
            o[i] = op.patch.stackValues[i][op.patch.stackValues[i].length - 1];
        }

        outObj.setRef(o);
    }
};
