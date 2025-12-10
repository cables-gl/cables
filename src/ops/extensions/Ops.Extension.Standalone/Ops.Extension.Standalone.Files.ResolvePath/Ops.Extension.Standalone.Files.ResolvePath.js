const fs=op.require("fs");
const path=op.require("path");

const
    inPath=op.inString("Path","~/"),
    outDir=op.outString("Result");

inPath.onChange=update;
update();

function update()
{
    op.setUiError("except", null);
    try
    {
        outDir.set(path.resolve(inPath.get()));
    }
    catch(e)
    {
        op.setUiError("except", e.message);
    }

}
