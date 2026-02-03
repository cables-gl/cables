const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inX = op.inFloat("X"),
    inY = op.inFloat("Y"),
    inZ = op.inFloat("Z"),
    inW = op.inFloat("W"),
    next = op.outTrigger("Next");

exec.onTriggered = () =>
{
    next.trigger();
};
