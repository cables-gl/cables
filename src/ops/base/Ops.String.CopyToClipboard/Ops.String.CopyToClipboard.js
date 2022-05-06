const
    inCopy= op.inTriggerButton("Copy"),
    inStr=op.inString("String","cablez");

inCopy.onTriggered=()=>
{
    navigator.clipboard.writeText(inStr.get());
};
