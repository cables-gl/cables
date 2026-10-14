const
    inArr=op.inArray("Array"),
    inValue=op.inValueString("SearchValue"),
    outFound=op.outNumber("Found",false),
    outIndex=op.outNumber("Index",-1);

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