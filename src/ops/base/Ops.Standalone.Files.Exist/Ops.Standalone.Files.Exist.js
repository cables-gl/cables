
const fs=op.require("fs");

const
    inPath=op.inString("Path","/"),
    outDir=op.outBoolNum("Exists");

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

