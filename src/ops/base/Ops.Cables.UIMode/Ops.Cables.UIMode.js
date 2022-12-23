const
    outUI = op.outBool("UI", op.patch.isEditorMode()),
    outRemoteViewer = op.outBool("Remote Viewer", window.gui ? window.gui.isRemoteClient : false),
    outCanvasMode = op.outNumber("Canvas Mode"),
    outPatchVisible = op.outBoolNum("Patch Field Visible");

if (CABLES.UI)
{
    gui.on("canvasModeChange", () =>
    {
        outCanvasMode.set(gui.getCanvasMode());
        outPatchVisible.set(gui.patchView.element.classList.contains("hidden"));
    });
}
