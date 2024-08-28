const fs=op.require("fs");
const path=op.require("path");

const
    inPath=op.inString("Path","~/"),
    outDir=op.outString("Result");

inPath.onChange=update;
update();

function update()
{
    try
    {
        outDir.set(path.resolve(inPath.get()));
    }
    catch(e)
    {
        console.log(e);
    }

}

