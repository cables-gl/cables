const
    inArr = op.inArray("Array"),
    inValue = op.inFloat("SearchValue"),
    outFound = op.outBoolNum("Found", false),
    outIndex = op.outNumber("Index", -1);

inValue.onChange =
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
