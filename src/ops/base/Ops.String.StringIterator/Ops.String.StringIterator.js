
var inExe=op.inTrigger("Exec");
var inString=op.inValueString("String","cables");

var next=op.outTrigger("Next");
var outIndex=op.outNumber("Index");
var outChar=op.outNumber("Character");
var outLength=op.outNumber("Length");

inExe.onTriggered=function()
{
    var str=inString.get();
    outLength.set(str.length);

    for(var i=0;i<str.length;i++)
    {
        outChar.set(str[i]);
        outIndex.set(i);
        next.trigger();
    }
};