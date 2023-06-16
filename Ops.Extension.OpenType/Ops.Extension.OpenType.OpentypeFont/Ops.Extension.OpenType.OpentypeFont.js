const
    filename = op.inUrl("Font File", [".otf", ".ttf", ".woff", ".woff2"]),
    outFont = op.outObject("Opentype Font", null, "opentype");

filename.onChange = async function ()
{
    const font = await opentype.load(filename.get());
    outFont.set(font);
};
