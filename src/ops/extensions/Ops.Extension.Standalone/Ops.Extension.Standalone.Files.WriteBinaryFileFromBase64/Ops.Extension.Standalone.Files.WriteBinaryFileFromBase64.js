const fs = op.require("fs");
const
    exec = op.inTriggerButton("Trigger"),
    inBase64 = op.inString("Base64", ""),
    inFilename = op.inString("Filename");

if (fs)
    exec.onTriggered = () =>
    {
        let b64 = inBase64.get() || "";

        if (b64.startsWith("data:"))
            b64 = b64.split(",")[1];

        fs.writeFile(inFilename.get(), b64, "base64",
            (err) =>
            {
                if (err) op.logError(err);
            });
    };
