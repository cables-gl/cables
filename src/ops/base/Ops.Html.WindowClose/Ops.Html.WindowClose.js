const
    inExec = op.inTriggerButton("Close");

inExec.onTriggered = function ()
{
    if (op.patch.isEditorMode()) return op.log("window close ignored in editor");
    window.close();
};
