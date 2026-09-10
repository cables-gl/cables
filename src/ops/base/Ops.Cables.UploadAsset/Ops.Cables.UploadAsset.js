const
    inFilename = op.inString("Filename", "file.bin"),
    inStr = op.inString("Base64 String", ""),
    inPatchId = op.inString("Patch ID", ""),
    inExec = op.inTriggerButton("Upload"),
    outResult = op.outString("Result"),
    outError = op.outBoolNum("Error"),
    outFinished = op.outTrigger("Finished");

inFilename.onChange = () =>
{
    this.setUiError("pathurl", null);
    if (inFilename.get() && inFilename.get().includes("/"))
    {
        this.setUiError("pathurl", "Upload will only use basename of given file.", 1);
    }
};

inPatchId.onChange = () =>
{
    this.setUiError("patchid", null);
    const patchId = inPatchId.get();
    if (patchId && (patchId.length < 6 || (patchId.length > 6 && patchId.length < 24) || patchId.length > 24))
    {
        this.setUiError("patchid", "Invalid patchid format", 1);
    }
};

inExec.onTriggered = () =>
{

    outError.set(false);

    let str = inStr.get();
    if (str.indexOf("data") != 0) str = "data:;base64," + str;

    if (CABLES.UI)
        gui.getFileManager().uploadFile(inFilename.get(), str, (err, res) =>
        {
            if (err)
            {
                outResult.set(err.msg);
                outError.set(true);
            }
            else
            {
                outResult.set(res.url);
            }
            outFinished.trigger();
        }, inPatchId.get());
};
