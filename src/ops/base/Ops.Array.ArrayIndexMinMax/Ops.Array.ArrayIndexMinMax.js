const
    inArr=op.inArray("Array"),
    outMax=op.outNumber("Max"),
    outIndexMax=op.outNumber("Index Max"),
    outMin=op.outNumber("Min"),
    outIndexMin=op.outNumber("Index Min");

inArr.onChange=
outMax.onChange=
outIndexMax.onChange=
outMin.onChange=
outIndexMin.onChange=()=>
{

    const arr=inArr.get();

    if(!arr)
    {
        outMax.set(0);
        outMin.set(0);
        return;
    }

    let min=Number.MAX_VALUE;
    let max=-Number.MAX_VALUE;
    let minIndex=-1;
    let maxIndex=-1;

    for(let i=0;i<arr.length;i++)
    {

        if(arr[i]<min)
        {
            minIndex=i;
            min=arr[i];
        }
        if(arr[i]>max)
        {
            maxIndex=i;
            max=arr[i];
        }

    }

    outMax.set(max);
    outIndexMax.set(maxIndex);
    outMin.set(min);
    outIndexMin.set(minIndex);


};