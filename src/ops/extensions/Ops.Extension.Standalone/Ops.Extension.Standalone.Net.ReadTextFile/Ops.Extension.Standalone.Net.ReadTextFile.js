const fs = op.require("fs");
const path = op.require("path");

const
    inFilename = op.inString("Filename", ""),
    exec = op.inTriggerButton("Read"),
    next = op.outTrigger("Next"),
    outStr = op.outString("Content"),
    outFile = op.outString("Resolved path"),
    error = op.outBoolNum("Has Error"),
    errorStr = op.outString("Error");

if (fs)
    exec.onTriggered = () =>
    {
        outFile.set(null);
        let filename = inFilename.get();
        if (!path.isAbsolute(filename))
        {
            const paths = op.patch.config.paths || {};
            if (paths.patchPath)
            {
                filename = path.join(paths.patchPath, inFilename.get());
            }
        }
        filename = path.resolve(filename);
        outFile.set(filename);

        fs.readFile(filename, "utf8", (err, data) =>
        {
            if (err)
            {
                outStr.set("");
                errorStr.set(error.message);
            }
            else outStr.set(data);
            next.trigger();
        });
    };
