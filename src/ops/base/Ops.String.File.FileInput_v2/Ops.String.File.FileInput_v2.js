const inFile = op.inUrl("File");
const outPath = op.outString("URL");

inFile.onChange = function ()
{
    const url = op.patch.getFilePath(String(inFile.get()));
    op.setUiAttrib({ "extendTitle": CABLES.basename(url) });
    outPath.set(url);
};
