op.name="StringContains";

var inStr=op.inValueString("String");
var inValue=op.inValueString("SearchValue");

var outFound=op.outValue("Found",false);
var outIndex=op.outValue("Index",-1);

inValue.onChange=exec;
inStr.onChange=exec;

function exec()
{
    if(inStr.get() && inValue.get().length>0)
    {
        var index=inStr.get().indexOf(inValue.get());

        outIndex.set(index);
        outFound.set(index>-1);
    }
    else
    {
        outIndex.set(-1);
        outFound.set(false);
        
    }
}