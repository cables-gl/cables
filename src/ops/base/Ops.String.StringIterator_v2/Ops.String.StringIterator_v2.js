const
    inExe = op.inTrigger("Exec"),
    inString = op.inString("String", "cables"),
    next = op.outTrigger("Next"),
    outChar = op.outString("Character"),
    outIndex = op.outNumber("Index"),
    outLength = op.outNumber("Length");

inExe.onTriggered = function ()
{
    let str = inString.get();
    outLength.set(str.length);

    for (let i = 0; i < str.length; i++)
    {
        outChar.set(str[i]);
        outIndex.set(i);
        next.trigger();
    }
};
