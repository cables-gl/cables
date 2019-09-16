const inArray1=op.inArray("Array in xyz"),
    outArray1=op.outArray("Array 1 out"),
    outArray2=op.outArray("Array 2 out"),
    outArrayLength = op.outNumber("Array lengths");

var showingError = false;

const arr1=[];
const arr2=[];

inArray1.onChange = update;

function update()
{
    var array1=inArray1.get();

    if(!array1)
    {
        outArray1.set(null);
        return;
    }

    if(array1.length % 2 !== 0)
    {
        if(!showingError)
        {
            op.uiAttr({error:"Arrays length not divisible by 2 !"});
            outArrayLength.set(0);
            showingError = true;
        }
        return;
    }
    if(array1.length === 0)
    {
        outArrayLength.set(0);
        outArray1.set(null);
        outArray2.set(null);
    }

    if(showingError)
    {
        showingError = false;
        op.uiAttr({error:null});
    }

    arr1.length = Math.floor(array1.length/2);
    arr2.length = Math.floor(array1.length/2);

    for(var i=0;i<array1.length/2;i++)
    {
        arr1[i] = array1[i*2];
        arr2[i] = array1[i*2+1];
    }

    outArray1.set(null);
    outArray2.set(null);
    outArray1.set(arr1);
    outArray2.set(arr2);
    outArrayLength.set(arr1.length);
}

