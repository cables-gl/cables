const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

op.setUiAttribs({ "display": "reroute" });

exec.onTriggered = () =>
{
    next.trigger();
};
