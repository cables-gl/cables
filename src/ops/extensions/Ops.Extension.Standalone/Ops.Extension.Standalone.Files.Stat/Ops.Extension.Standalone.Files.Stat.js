
const fs=op.require("fs");

const
    inPath=op.inString("Path","/"),
    outStats=op.outObject("Stats"),
    outDir=op.outBoolNum("Is Directory"),
    outFile=op.outBoolNum("Is File"),
    outError=op.outBoolNum("Has Error"),
    outErrorStr=op.outString("Error");


inPath.onChange= () =>
{

    try
    {
        const stats=fs.statSync(inPath.get());

        outError.set(false);
        outErrorStr.set("");
        outStats.set(stats);

        outDir.set(stats.isDirectory());
        outFile.set(stats.isFile());
    }
    catch(e)
    {
        outErrorStr.set(e.message);
        outError.set(true);
    }


};

