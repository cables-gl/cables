const exe = op.inTrigger("Trigger in"),
    inArr1=op.inArray("Array 1"),
    inArr2=op.inArray("Array 2"),
    inArr3=op.inArray("Array 3"),
    inArr4=op.inArray("Array 4"),
    outTrigger = op.outTrigger("Trigger out"),
    outArr=op.outArray("Array out"),
    outArrayLength = op.outNumber("Array length");

var showingError = false;

var arr=[];
var emptyArray=[];
var needsCalc = true;

exe.onTriggered = update;

inArr1.onChange=inArr2.onChange=inArr3.onChange=inArr4.onChange=calcLater;
function calcLater()
{
    needsCalc=true;
}

function update()
{
    outTrigger.trigger();
    var array1=inArr1.get();
    var array2=inArr2.get();
    var array3=inArr3.get();
    var array4=inArr4.get();

    if(!array1 && !array2 && !array3 && !array4 )
    {
        outArr.set(null);
        return;
    }

    if(needsCalc)
    {
        var arrlen=0;

        if(!array1 || !array2 || !array3 || !array4)
        {
            if(array1) arrlen=array1.length;
                else if(array2) arrlen = array2.length;
                else if(array3) arrlen = array3.length;
                else if(array4) arrlen = array4.length;

            if(emptyArray.length!=arrlen)
                for(var i=0;i<arrlen;i++) emptyArray[i]=0;

            if(!array1)array1 = emptyArray;
            if(!array2)array2 = emptyArray;
            if(!array3)array3 = emptyArray;
            if(!array4)array4 = emptyArray;
        }

        if((array1.length !== array2.length) || (array2.length !== array3.length)
                || (array3.length !== array4.length))
        {
            if(!showingError)
            {
                op.uiAttr({error:"Arrays do not have the same length !"});
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

        arr.length = array1.length;

        for(var i=0; i<array1.length; i++)
        {
            arr[i*4+0] = array1[i];
            arr[i*4+1] = array2[i];
            arr[i*4+2] = array3[i];
            arr[i*4+3] = array4[i];

        }
        needsCalc = false;
        outArr.set(null);
        outArr.set(arr);
        outArrayLength.set(arr.length);
    }
}
