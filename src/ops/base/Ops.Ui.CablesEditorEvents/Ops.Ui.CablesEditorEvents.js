const
    outSaving = op.outTrigger("Saving Patch"),
    outEdit = op.outTrigger("PortValueEdited"),
    outOpAdd = op.outTrigger("Op Add"),
    outOpDelete = op.outTrigger("Op Delete"),
    outLink = op.outTrigger("Port Link"),
    inTriggerChanged = op.inTriggerButton("Set Changed Patch");

op.patch.on("uiSavePatch", () =>
{
    outSaving.trigger();
});

op.patch.on("uiSavePatch", () =>
{
    outSaving.trigger();
});

op.patch.on("onOpAdd", () =>
{
    outOpAdd.trigger();
});

op.patch.on("onOpDelete", () =>
{
    outOpDelete.trigger();
});
op.patch.on("onLink", () =>
{
    outLink.trigger();
});
op.patch.on("onUnLink", () =>
{
    outLink.trigger();
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
