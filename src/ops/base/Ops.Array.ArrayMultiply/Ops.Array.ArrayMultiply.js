op.name="ArrayMultiply";

var inArray=op.inArray("In");
var inValue=op.inValue("Value");
var outArray=op.outArray("Result");


var newArr=[];
outArray.set(newArr);

inArray.onChange=function()
{
    var arr=inArray.get();
    if(!arr)return;
    
    var mul=inValue.get();
    
    if(newArr.length!=arr.length)newArr.length=arr.length;
    
    for(var i=0;i<arr.length;i++)
    {
        newArr[i]=arr[i]*mul;
    }
    
    
    outArray.set(null);

    outArray.set(newArr);

    
    
};