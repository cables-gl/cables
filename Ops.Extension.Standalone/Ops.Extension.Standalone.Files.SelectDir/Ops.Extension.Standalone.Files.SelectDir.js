op.require("fs");
const
    inPath=op.inString("Default Path",""),
    exec = op.inTriggerButton("Select Directory"),
    outPath=op.outString("Path");

exec.onTriggered = () =>
{
    if(CABLES.UI)
        CABLESUILOADER.talkerAPI.send("selectDir",{dir:inPath.get()});

    // TODO SET outPath!
};

