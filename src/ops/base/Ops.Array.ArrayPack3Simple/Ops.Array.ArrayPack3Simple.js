const
    inArr1=op.inArray("Array 1"),
    inArr2=op.inArray("Array 2"),
    inArr3=op.inArray("Array 3"),

    outArr=op.outArray("Array out"),
    outNum=op.outValue("Num Points"),
    outArrayLength = op.outNumber("Array length");

var showingError = false;

var arr=[];
var emptyArray=[];
var needsCalc = true;


inArr1.onChange=inArr2.onChange=inArr3.onChange=update;

function update()
{
    var array1=inArr1.get();
    var array2=inArr2.get();
    var array3=inArr3.get();

    if(!array1 && !array2 && !array3 )
    {
        outArr.set(null);
        outNum.set(0);
        return;
    }
    var arrlen=0;

    if(!array1 || !array2 || !array3)
    {
        if(array1) arrlen=array1.length;
            else if(array2) arrlen=array2.length;
            else if(array3) arrlen=array3.length;

        if(emptyArray.length!=arrlen)
            for(var i=0;i<arrlen;i++) emptyArray[i]=0;

        if(!array1)array1=emptyArray;
        if(!array2)array2=emptyArray;
        if(!array3)array3=emptyArray;
    }

    if((array1.length !== array2.length) || (array2.length !== array3.length))
    {
        //
        op.setUiError("arraylen","Arrays do not have the same length !");
        return;
    }
    op.setUiError("arraylen",null);

    arr.length = array1.length;
    for(var i=0;i<array1.length;i++)
    {
        arr[i*3+0] = array1[i];
        arr[i*3+1] = array2[i];
        arr[i*3+2] = array3[i];
    }

    needsCalc = false;
    outArr.set(null);
    outArr.set(arr);
    outNum.set(arr.length/3);
    outArrayLength.set(arr.length);
}
