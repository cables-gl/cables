const inFile=op.inFile("File");
const outPath=op.outValueString("URL");

inFile.onChange=function()
{
    var url=op.patch.getFilePath(String(inFile.get()));
    outPath.set(url);
};