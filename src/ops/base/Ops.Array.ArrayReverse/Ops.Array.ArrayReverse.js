var inArr=op.inArray("Input");
var outArr=op.outArray("Result");

inArr.onChange=function()
{
    var arr=inArr.get();
    if(arr) {
        var arrCopy = arr.slice();
        outArr.set(arrCopy.reverse());
    }
};