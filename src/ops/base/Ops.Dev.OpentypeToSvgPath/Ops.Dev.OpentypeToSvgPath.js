const
    inFont = op.inObject("Opentype Font"),
    inStr = op.inString("Text", "cables"),
    outPathStr = op.outString("Path String");

inStr.onChange =
inFont.onChange = async function ()
{
    const font = inFont.get();
    if (!font || !font.getPath)
    {
        outPathStr.set("");
        return;
    }

    const path = font.getPath(inStr.get(), 0, 0, 72);

    // console.log(font)
    const pathStr = path.toPathData(8);
    outPathStr.set(pathStr);
};
