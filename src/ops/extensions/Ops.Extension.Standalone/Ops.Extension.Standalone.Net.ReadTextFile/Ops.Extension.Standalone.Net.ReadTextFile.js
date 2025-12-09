const fs = op.require("fs");
const
    inFilename = op.inString("Filename", ""),
    exec = op.inTriggerButton("Read"),
    next = op.outTrigger("Next"),
    outStr = op.outString("Content"),
    error = op.outBoolNum("Has Error"),
    errorStr = op.outString("Error");

if (fs)
    exec.onTriggered = () =>
    {
        fs.readFile(inFilename.get(), "utf8",
            function (err, data)
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
