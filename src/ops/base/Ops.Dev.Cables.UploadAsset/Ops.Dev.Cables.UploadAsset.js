const
    inFilename = op.inString("Filename", "file.bin"),
    inStr = op.inString("Base64 String", ""),
    inExec = op.inTriggerButton("Upload"),
    outResult = op.outString("Result"),
    outError = op.outBoolNum("Error");

inExec.onTriggered = () =>
{
    outError.set(false);

    gui.fileManager.uploadFile(inFilename.get(), "data:;base64," + inStr.get(), (err, res) =>
    {
        console.log(err, res);

        if (err)
        {
            outResult.set(err.msg);
            outError.set(true);
        }
    });
};
