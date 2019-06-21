
var inArr=op.inArray("Array3x");

var mulX=op.inValue("Mul X",1);
var mulY=op.inValue("Mul Y",1);
var mulZ=op.inValue("Mul Z",1);

var outArr=op.outArray("Result");

var arr=[];

mulY.onChange=mulX.onChange=mulZ.onChange=
inArr.onChange=function()
{
    var newArr=inArr.get();
    if(newArr)
    {
        if(arr.length!=newArr.length)arr.length=newArr.length;

        for(var i=0;i<newArr.length;i+=3)
        {
            arr[i+0]=newArr[i+0]*mulX.get();
            arr[i+1]=newArr[i+1]*mulY.get();
            arr[i+2]=newArr[i+2]*mulZ.get();
        }

        outArr.set(null);
        outArr.set(arr);
    }
    else
    {
        outArr.set(null);
    }

};