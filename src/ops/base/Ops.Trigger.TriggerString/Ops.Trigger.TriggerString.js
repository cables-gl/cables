const
    exec=op.inTriggerButton("Trigger"),
    inString=op.inString("String",""),
    next=op.outTrigger("Next"),
    outString=op.outString("Result");


exec.onTriggered=function()
{
    outString.set(inString.get());
    next.trigger();

};

