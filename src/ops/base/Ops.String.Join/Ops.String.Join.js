op.name="Join";

var inArr=op.inArray("Array");
var inSeperator=op.inValueString("Seperator",",");
var inNewLine=op.inValueBool("New Line");
var outStr=op.outValue("Result");

inArr.onChange=exec;
outStr.onChange=exec;
inSeperator.onChange=exec;
inNewLine.onChange=exec;


function exec()
{
    var arr=inArr.get();
    var result='';
    
    var sep=inSeperator.get();
    if(inNewLine.get())sep+='\n';
    
    if(arr && arr.join)
    {
        
        result=arr.join(sep);
    }
    
    outStr.set(result);
}