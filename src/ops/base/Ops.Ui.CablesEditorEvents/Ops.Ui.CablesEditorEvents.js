const
    outSaving = op.outTrigger("Saving Patch"),
    outEdit = op.outTrigger("PortValueEdited"),
    inTriggerChanged = op.inTriggerButton("Set Changed Patch");

op.patch.on("uiSavePatch", () =>
{
    outSaving.trigger();
});

op.patch.on("uiSavePatch", () =>
{
    outSaving.trigger();
});

if (window.gui)
    window.gui.on("portValueEdited", () =>
    {
        outEdit.trigger();
    });

inTriggerChanged.onTriggered = () =>
{
    if (!CABLES.UI) return;
    gui.savedState.setUnSaved("ui event op", op.getSubPatch());
};
