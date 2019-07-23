const
    inArray1=op.inArray("Array in xyzw"),
    outArray1=op.outArray("Array 1 out"),
    outArray2=op.outArray("Array 2 out"),
    outArray3=op.outArray("Array 3 out"),
    outArray4=op.outArray("Array 4 out"),
    outArrayLength = op.outNumber("Array lengths");

var showingError = false;

const arr1=[];
const arr2=[];
const arr3=[];
const arr4=[];

inArray1.onChange = update;

function update()
{
    var array1=inArray1.get();

    if(!array1)
    {
        outArray1.set(null);
        return;
    }

    if(array1.length % 4 !== 0)
    {
        if(!showingError)
        {
            op.uiAttr({error:"Arrays length not divisible by 4 !"});
            outArrayLength.set(0);
            showingError = true;
        }
        return;
    }

    if(showingError)
    {
        showingError = false;
        op.uiAttr({error:null});
    }

    arr1.length = Math.floor(array1.length/4);
    arr2.length = Math.floor(array1.length/4);
    arr3.length = Math.floor(array1.length/4);
    arr4.length = Math.floor(array1.length/4);

    for(var i=0;i<array1.length/4;i++)
    {
        arr1[i] = array1[i*4];
        arr2[i] = array1[i*4+1];
        arr3[i] = array1[i*4+2];
        arr4[i] = array1[i*4+3];
    }

    outArray1.set(null);
    outArray2.set(null);
    outArray3.set(null);
    outArray4.set(null);
    outArray1.set(arr1);
    outArray2.set(arr2);
    outArray3.set(arr3);
    outArray4.set(arr4);
    outArrayLength.set(arr1.length);
}

