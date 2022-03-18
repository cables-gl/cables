const
    filename = op.inUrl("Font File", [".otf", ".ttf", ".woff", ".woff2"]),
    // inStr = op.inString("Text", "cables"),
    outFont = op.outObject("Opentype Font", null, "opentype");
    // outPathStr = op.outString("Path String");

// inStr.onChange =
filename.onChange = async function ()
{
    const font = await opentype.load(filename.get());

    outFont.set(font);
    // const path = font.getPath(inStr.get(), 0, 0, 72);

    // // console.log(font)
    // const pathStr = path.toPathData(8);
    // outPathStr.set(pathStr);
};
