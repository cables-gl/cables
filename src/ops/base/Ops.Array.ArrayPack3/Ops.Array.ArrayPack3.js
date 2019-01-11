const exe = op.inTrigger("Trigger in");
const inArr1=op.inArray("Array 1");
const inArr2=op.inArray("Array 2");
const inArr3=op.inArray("Array 3");

const outArr=op.outArray("Array out");

var showingError = false;

var arr=[];

exe.onTriggered = update;


function update()
{
    var array1=inArr1.get();
    var array2=inArr2.get();
    var array3=inArr3.get();

    if(!array1 || !array2 || !array3 )
    {
        outArr.set(null);
        return;
    }

    if((array1.length !== array2.length) || (array2.length !== array3.length))
    {
        if(!showingError)
        {
            op.uiAttr({error:"Arrays do not have the same length !"});
            showingError = true;
        }
        return;
    }

    if(showingError)
    {
        showingError = false;
        op.uiAttr({error:null});
    }

    arr.length = array1.length;
    for(var i=0;i<array1.length;i++)
    {
        arr[i*3+0] = array1[i];
        arr[i*3+1] = array2[i];
        arr[i*3+2] = array3[i];

    }

    outArr.set(null);
    outArr.set(arr);
}

