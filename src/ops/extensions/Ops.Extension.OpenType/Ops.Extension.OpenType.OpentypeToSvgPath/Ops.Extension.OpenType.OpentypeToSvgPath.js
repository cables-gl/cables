const
    inFont = op.inObject("Opentype Font"),
    inStr = op.inString("Text", "cables"),
    inLetterSpace = op.inFloat("Letter Spacing", 0),
    inLineHeight = op.inFloat("Line Height", 1),
    outPathStr = op.outString("Path String");

op.toWorkPortsNeedToBeLinked(inFont);

inStr.onChange =
inLetterSpace.onChange =
inFont.onChange = async function ()
{
    const font = inFont.get();
    if (!font || !font.getPath)
    {
        outPathStr.set("");
        return;
    }

    let str = "";
    let y = 0;
    let lines = inStr.get();
    lines = lines.split("\n");
    let letterSpace = inLetterSpace.get();
    let fontSize = 72;

    for (let il = 0; il < lines.length; il++)
    {
        const line = lines[il];
        const paths = font.getPaths(line, 0, 0, fontSize);
        y = il * fontSize * inLineHeight.get();

        for (let i = 0; i < paths.length; i++)
        {
            for (let j = 0; j < paths[i].commands.length; j++)
            {
                if (paths[i].commands[j].hasOwnProperty("x")) paths[i].commands[j].x += i * letterSpace;
                if (paths[i].commands[j].hasOwnProperty("x1")) paths[i].commands[j].x1 += i * letterSpace;
                if (paths[i].commands[j].hasOwnProperty("y")) paths[i].commands[j].y += y;
                if (paths[i].commands[j].hasOwnProperty("y1")) paths[i].commands[j].y1 += y;
            }
            str += paths[i].toPathData();
        }
    }
    outPathStr.set(str);
};
