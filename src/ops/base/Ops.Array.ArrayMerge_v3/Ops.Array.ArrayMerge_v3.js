const numArrays=8;
const inArrs=[];

for(let i =0;i<numArrays;i++)
{
    inArrs[i]=op.inArray("Array "+i);
    inArrs[i].onChange=function()
    {
        update();
    }
}

const
    outArr=op.outArray("Result"),
    outArrayLength = op.outNumber("Array length");

var arr=[];

function update()
{

    arr.length=0;

    for(let i=0;i<numArrays;i++)
    {
        const ar=inArrs[i].get();
        if(ar)arr=arr.concat(ar);
    }
    // var arr1 = inArr.get();
    // var arr2 = inArr2.get();

    // if(!arr1 || !arr2)
    // {
    //     outArr.set(null);
    //     outArrayLength.set(0);
    //     return;
    // }

    // if(arr1 && arr2)
    // {
    //     arr=arr.concat(inArr.get());
    //     arr=arr.concat(inArr2.get());
    // }
    outArr.set(null);
    outArr.set(arr);
    outArrayLength.set(arr.length);
};