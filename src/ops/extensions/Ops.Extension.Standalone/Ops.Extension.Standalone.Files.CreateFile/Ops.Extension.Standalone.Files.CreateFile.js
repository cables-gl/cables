op.require("fs");
const
    inPath = op.inString("Default Path", ""),
    exec = op.inTriggerButton("Create File"),
    outPath = op.outString("Path"),
    outTrigger = op.outTrigger("Next");

exec.onTriggered = () =>
{
    op.setUiError("dir", null);
    if (CABLES.UI)
    {
        const fileName = inPath.get() || "newfile.txt";
        CABLESUILOADER.talkerAPI.send("createFile", { "name": fileName, "content": "" }, (err, dirName) =>
        {
            if (err) op.setUiError("dir", err);
            outPath.set(dirName || "");
            outTrigger.trigger();
        });
    }
};

