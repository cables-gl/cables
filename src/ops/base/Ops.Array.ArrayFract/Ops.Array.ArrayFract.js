//returns the fractional remainder from array values
const inArray=op.inArray("In"),
    outArray=op.outArray("Result");

var newArr=[];
outArray.set(newArr);

inArray.onChange=function()
{
    var arr=inArray.get();

    if(!arr)
    {
        outArray.set(null);
        return;
    }

    if(newArr.length != arr.length) newArr.length=arr.length;

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = Math.abs(arr[i]) % 1;
    }
    outArray.set(null);
    outArray.set(newArr);
};
