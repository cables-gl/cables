const
    filename = op.inUrl("Font File", [".otf", ".ttf", ".woff", ".woff2"]),
    outFont = op.outObject("Opentype Font", null, "opentype");

filename.onChange = async function ()
{
    const fontFile = op.patch.getFilePath(String(filename.get()));

    op.setUiError("exc", null);

    try
    {
        const font = await opentype.load(fontFile);
        outFont.set(font);
    }
    catch(e)
    {
        console.log(e);
        let str=e.toString();
        str=str.replaceAll("<","&lt;");
        str=str.replaceAll(">","&gt;");
        op.setUiError("exc", "opentype error "+str);
    }
};
