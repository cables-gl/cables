var inArray=op.inArray("In");
var inValue=op.inValue("Value",1.0);
var outArray=op.outArray("Result");

var newArr=[];
outArray.set(newArr);
inArray.onChange=
inValue.onChange=inArray.onChange=function()
{
    var arr=inArray.get();
    if(!arr)return;

    var add=inValue.get();

    if(newArr.length!=arr.length)newArr.length=arr.length;

    for(var i=0;i<arr.length;i++)
    {
        newArr[i]=arr[i]+add;
    }
    outArray.set(null);
    outArray.set(newArr);
};
