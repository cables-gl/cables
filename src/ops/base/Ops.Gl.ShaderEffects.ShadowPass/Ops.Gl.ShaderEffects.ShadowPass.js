const
    exec = op.inTrigger("Trigger"),
    nextShadow = op.outTrigger("Next Shadow Pass"),
    nextNormal = op.outTrigger("Next Normal Pass");

exec.onTriggered = () =>
{
    if (op.patch.cgl.tempData.shadowPass)nextShadow.trigger();
    else nextNormal.trigger();
};
