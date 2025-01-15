const
    outUI = op.outBoolNum("UI", op.patch.isEditorMode()),
    outOverlay = op.outBoolNum("Overlay Mode", false),
    outRemoteViewer = op.outBoolNum("Remote Viewer", window.gui ? window.gui.isRemoteClient : false),
    outStandalone = op.outBoolNum("Is Standalone", (CABLES.platform && CABLES.platform.frontendOptions.isElectron)),
    outCanvasMode = op.outNumber("Canvas Mode"),
    outPatchVisible = op.outBoolNum("Patch Field Visible");

if (CABLES.UI)
{
    outOverlay.set(gui.shouldDrawOverlay);

    gui.on("overlaysChanged", (active) =>
    {
        outOverlay.set(active);
    });

    gui.on("canvasModeChange", () =>
    {
        outCanvasMode.set(gui.canvasManager.mode);
        outPatchVisible.set(gui.patchView.element.classList.contains("hidden"));
    });
}
