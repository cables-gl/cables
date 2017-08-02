op.name="ArrayContains";

var inArr=op.inArray("Array");
var inValue=op.inValueString("SearchValue");

var outFound=op.outValue("Found",false);
var outIndex=op.outValue("Index",-1);

inValue.onChange=exec;
inArr.onChange=exec;

function exec()
{
    if(inArr.get())
    {
        var index=inArr.get().indexOf(inValue.get());
        
        outIndex.set(index);
        outFound.set(index>-1);
    }
}