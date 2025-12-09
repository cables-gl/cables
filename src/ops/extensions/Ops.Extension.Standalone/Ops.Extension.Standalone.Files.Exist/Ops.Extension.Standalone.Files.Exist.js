
const fs=op.require("fs");

const
    inPath=op.inString("Path","/"),
    inExec=op.inTriggerButton("Execute"),
    outDir=op.outBoolNum("Exists");

inExec.onTriggered=
inPath.onChange= () =>
{
    try
    {
        outDir.set(fs.existsSync(inPath.get()));
    }
    catch(e)
    {
        outDir.set(false);
    }

};

