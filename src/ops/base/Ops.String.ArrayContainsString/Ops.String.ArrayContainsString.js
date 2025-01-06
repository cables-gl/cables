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
    let arr = inArr.get();
    if (arr)
    {
        if (!Array.isArray(arr)) arr = Array.from(arr);
        const index = arr.indexOf(inValue.get());

        outIndex.set(index);
        outFound.set(index > -1);
    }
}
