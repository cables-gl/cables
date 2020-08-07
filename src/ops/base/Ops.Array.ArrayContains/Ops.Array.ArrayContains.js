const
    inArr=op.inArray("Array"),
    inValue=op.inValueString("SearchValue"),
    outFound=op.outValue("Found",false),
    outIndex=op.outValue("Index",-1);

inValue.onChange=
    inArr.onChange=exec;

function exec()
{
    if(inArr.get())
    {
        const index=inArr.get().indexOf(inValue.get());

        outIndex.set(index);
        outFound.set(index>-1);
    }
}