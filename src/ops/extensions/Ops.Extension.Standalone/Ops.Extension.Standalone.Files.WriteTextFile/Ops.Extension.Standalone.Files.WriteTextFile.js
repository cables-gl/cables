const fs = op.require("fs");
const path = op.require("path");

const
    inFilename = op.inString("Filename", ""),
    inStr = op.inString("Content", ""),
    exec = op.inTriggerButton("Write"),
    next = op.outTrigger("Next"),
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

        fs.mkdir(path.dirname(filename), { "recursive": true }, (err) =>
        {
            if (err)
            {
                errorStr.set("Error:" + err.message);
            }
            else
            {
                fs.writeFile(filename, inStr.get(), {
                    "encoding": "utf8",
                    "flag": "w"
                }, (err) =>
                {
                    if (err)
                    {

                        errorStr.set("Error:" + err.message);
                    }
                    else
                    {
                        outFile.set(filename);
                        errorStr.set();
                    }
                    next.trigger();
                });
            }

        });

    };
