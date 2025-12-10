op.require("fs");
const
    inPath=op.inString("Path",""),
    exec = op.inTriggerButton("Open File Manager");

exec.onTriggered = () =>
{
    CABLESUILOADER.talkerAPI.send("openDir",{dir:inPath.get()});
};

