const
    inStr = op.inString("String"),
    inValue = op.inString("SearchValue"),
    outFound = op.outBoolNum("Found", false),
    outIndex = op.outNumber("Index", -1);

inValue.onChange =
    inStr.onChange = exec;

exec();

function exec()
{
    if (inStr.get() && inValue.get() && inValue.get().length > 0)
    {
        const index = inStr.get().indexOf(inValue.get());
        outIndex.set(index);
        outFound.set(index > -1);
    }
    else
    {
        outIndex.set(-1);
        outFound.set(false);
    }
}
