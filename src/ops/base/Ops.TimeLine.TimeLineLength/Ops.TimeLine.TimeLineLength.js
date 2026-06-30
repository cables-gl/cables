const
    inUpdate = op.inTriggerButton("update"),
    outLength = op.outNumber("Length");

inUpdate.onTriggered = update;

op.on("loadedValueSet", update);
update();

op.patch.on(CABLES.Patch.EVENT_ANIM_MAXTIME_CHANGE, () =>
{
    update();
});

function update()
{
    op.patch.updateAnimMaxTime();
    outLength.set(op.patch.animMaxTime);
}
