const
    exe=op.inTriggerButton("exe"),
    v=op.inValue("value"),
    next=op.outTrigger("Next"),
    result=op.addOutPort(new CABLES.Port(op,"result"));

exe.onTriggered=exec;
result.changeAlways=true;

function exec()
{
    result.set(v.get());
    next.trigger();
}

