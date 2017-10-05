op.name="ArrayReverse";

var inArr=op.inArray("Input");

var outArr=op.outArray("Result");

inArr.onChange=function()
{
    var arr=inArr.get();
    if(arr)
        outArr.set(arr.reverse());
    
};