const
    exe = op.inTriggerButton("exe"),
    v = op.inFloat("value"),
    next = op.outTrigger("Next"),
    result = op.addOutPort(new CABLES.Port(op, "result"));

exe.onTriggered = exec;
result.changeAlways = true;
op.toWorkPortsNeedToBeLinked(exe);

function exec()
{
    result.set(v.get());
    next.trigger();
}
