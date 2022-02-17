
const outUI = op.outBool("UI", op.patch.isEditorMode());
const outRemoteViewer = op.outBool("Remote Viewer", gui ? gui.isRemoteClient : false);
