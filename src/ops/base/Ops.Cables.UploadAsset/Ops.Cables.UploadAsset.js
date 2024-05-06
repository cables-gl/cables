const
    inFilename = op.inString("Filename", "file.bin"),
    inStr = op.inString("Base64 String", ""),
    inExec = op.inTriggerButton("Upload"),
    outResult = op.outString("Result"),
    outError = op.outBoolNum("Error");

inExec.onTriggered = () =>
{
    outError.set(false);

    let str = inStr.get();
    if (str.indexOf("data" != 0))str = "data:;base64," + str;

    if (CABLES.UI)
        gui.getFileManager().uploadFile(inFilename.get(), str, (err, res) =>
        {
            console.log(err, res);

            if (err)
            {
                outResult.set(err.msg);
                outError.set(true);
            }
        });
};
