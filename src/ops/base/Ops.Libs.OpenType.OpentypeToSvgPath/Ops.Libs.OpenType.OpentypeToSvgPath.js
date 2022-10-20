const
    inFont = op.inObject("Opentype Font"),
    inStr = op.inString("Text", "cables"),
    inLs = op.inFloat("Letter Spacing", 0),
    outPathStr = op.outString("Path String");

inStr.onChange =
inLs.onChange =
inFont.onChange = async function ()
{
    const font = inFont.get();
    if (!font || !font.getPath)
    {
        outPathStr.set("");
        return;
    }

    const paths = font.getPaths(inStr.get(), 0, 0, 72);
    let str = "";

    let ls = inLs.get();

    for (let i = 0; i < paths.length; i++)
    {
        for (let j = 0; j < paths[i].commands.length; j++)
        {
            if (paths[i].commands[j].hasOwnProperty("x"))
                paths[i].commands[j].x += i * ls;
            if (paths[i].commands[j].hasOwnProperty("x1"))
                paths[i].commands[j].x1 += i * ls;
        }
        str += paths[i].toPathData();
    }

    outPathStr.set(str);
};
