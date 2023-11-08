const
    outUI = op.outBoolNum("UI", op.patch.isEditorMode()),
    outRemoteViewer = op.outBoolNum("Remote Viewer", window.gui ? window.gui.isRemoteClient : false),
    outCanvasMode = op.outNumber("Canvas Mode"),
    outPatchVisible = op.outBoolNum("Patch Field Visible");

if (CABLES.UI)
{
    gui.on("canvasModeChange", () =>
    {
        outCanvasMode.set(gui.canvasManager.mode);
        outPatchVisible.set(gui.patchView.element.classList.contains("hidden"));
    });
}
