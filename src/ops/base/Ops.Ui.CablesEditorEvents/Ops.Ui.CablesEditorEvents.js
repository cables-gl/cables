const
    outSaving = op.outTrigger("Saving Patch"),
    inTriggerChanged = op.inTriggerButton("Set Changed Patch");

op.patch.on("uiSavePatch", () =>
{
    outSaving.trigger();
});

inTriggerChanged.onTriggered = () =>
{
    if (!CABLES.UI) return;
    gui.savedState.setUnSaved("ui event op", op.getSubPatch());
};
