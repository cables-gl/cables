const
    exec = op.inTrigger("Trigger"),
    inPass = op.inSwitch("Pass", ["All", "Shadow", "Color"], "Color"),
    next = op.outTrigger("Next Shadow Pass");

exec.onTriggered = () =>
{
    if (inPass.get() == "All")next.trigger();
    else if (op.patch.cgl.tempData.shadowPass && inPass.get() != "Color")next.trigger();
    else if (!op.patch.cgl.tempData.shadowPass && inPass.get() == "Color")next.trigger();
};
