const
    exec = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    result = op.outNumber("Material Id");

exec.onTriggered = () =>
{
    const cgl = op.patch.cgl;

    result.set(cgl.tempData.objectIdCounter || 0);

    next.trigger();
};
