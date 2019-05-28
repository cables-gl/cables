const
    inExe=op.inTrigger("Exec"),
    inString=op.inString("String","cables"),
    next=op.outTrigger("Next"),
    outChar=op.outString("Character"),
    outIndex=op.outValue("Index"),
    outLength=op.outValue("Length");

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