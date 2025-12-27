const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inO = op.inObject("GpuBuffer"),
    next = op.outTrigger("Next");

exec.onTriggered = () =>
{
    next.trigger();
};
