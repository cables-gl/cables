const inFile = op.inUrl("File");
const outPath = op.outString("URL");

inFile.onChange = function ()
{
    const url = op.patch.getFilePath(String(inFile.get()));
    outPath.set(url);
};
