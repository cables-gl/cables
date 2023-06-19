const
    inArr = op.inArray("Array"),
    inValue = op.inString("SearchValue"),
    outFound = op.outBoolNum("Found", false),
    outIndex = op.outNumber("Index", -1);

inValue.onChange = () =>
{
    if (!inValue.isLinked()) op.setUiAttrib({ "extendTitle": inValue.get() });
    exec();
};

inArr.onChange = exec;

function exec()
{
    if (inArr.get())
    {
        const index = inArr.get().indexOf(inValue.get());

        outIndex.set(index);
        outFound.set(index > -1);
    }
}
