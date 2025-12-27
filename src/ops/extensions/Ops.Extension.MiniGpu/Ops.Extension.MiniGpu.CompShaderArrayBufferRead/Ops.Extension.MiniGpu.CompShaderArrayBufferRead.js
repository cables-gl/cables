const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inO = op.inObject("GpuBuffer"),
    next = op.outTrigger("Next");

let buffer = null;

exec.onTriggered = () =>
{
    next.trigger();
};
