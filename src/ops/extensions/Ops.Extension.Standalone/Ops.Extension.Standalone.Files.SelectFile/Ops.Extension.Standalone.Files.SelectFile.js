const fs = op.require("fs");
const path = op.require("path");

const
    inPath = op.inString("Default Path", ""),
    exec = op.inTriggerButton("Select File"),
    outPath = op.outString("Path"),
    outResolvedPath = op.outString("Resolved path"),
    outTrigger = op.outTrigger("Next");

exec.onTriggered = () =>
{
    outPath.set(null);
    outResolvedPath.set(null);
    let dirname = inPath.get();
    if (!path.isAbsolute(dirname))
    {
        const paths = op.patch.config.paths || {};
        if (paths.patchPath)
        {
            dirname = path.join(paths.patchPath, dirname);
        }
    }
    dirname = path.resolve(dirname);

    op.setUiError("dir", null);
    if (CABLES.UI)
    {
        CABLESUILOADER.talkerAPI.send("selectFile", { "dir": dirname }, (err, dirName) =>
        {
            outResolvedPath.set(dirname);
            if (err) op.setUiError("dir", err);
            outPath.set(dirName || "");
            outTrigger.trigger();
        });
    }
};
