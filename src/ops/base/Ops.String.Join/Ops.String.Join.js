op.name="Join";

var inArr=op.inArray("Array");
var inSeperator=op.inValueString("Seperator",",");

var outStr=op.outValue("Result");

inArr.onChange=exec;
outStr.onChange=exec;
inSeperator.onChange=exec;



function exec()
{
    var arr=inArr.get();
    var result='';
    
    if(arr)
    {
        result=arr.join(inSeperator.get());
    }
    
    outStr.set(result);
}