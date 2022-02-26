const outUI = op.outBool("UI", op.patch.isEditorMode());
const outRemoteViewer = op.outBool("Remote Viewer", window.gui ? window.gui.isRemoteClient : false);
