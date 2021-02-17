const
    inArr=op.inArray("Array"),
    inNum=op.inFloat("Value",0),
    outIndex=op.outNumber("Index");

inArr.onChange=
    inNum.onChange=update;

function update()
{
    const arr=inArr.get();

    if(!arr)
    {
        outIndex.set(-1);
        return;
    }

    const n=inNum.get();

    if(n<arr[0])return outIndex.set(0);

    for(let i=0;i<arr.length-1;i++)
    {

        if(n>arr[i] && n<arr[i+1])
        {
            outIndex.set(i+1);
            return;
        }
    }

}