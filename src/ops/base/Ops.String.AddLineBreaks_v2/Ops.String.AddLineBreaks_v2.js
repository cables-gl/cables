const
    inStr = op.inString("String", ""),
    inMaxLineChars = op.inInt("Max Characters per Line", 20),
    outStr = op.outString("Result");

inMaxLineChars.onChange =
    inStr.onChange = update;

function update()
{
    const str = inStr.get();
    if (!str)
    {
        outStr.set("");
        return;
    }

    outStr.set(explode(str, Math.max(1, inMaxLineChars.get())));
}

function explode(text, max)
{
    if (text == null) return "";
    if (text.length <= max) return text;
    const nextNewLine = /\n/.exec(text);
    const lineLength = nextNewLine ? nextNewLine.index : text.length;
    if (lineLength <= max)
    {
        const line = text.substr(0, lineLength);
        const rest = text.substr(lineLength + 1);
        return line + "\n" + explode(rest, max);
    }
    else
    {
        let line = text.substr(0, max);
        let rest = text.substr(max);
        const res = (/([\s])[^\s]*$/.exec(line));
        if (res)
        { //
            line = text.substr(0, res.index);
            rest = text.substr(res.index + 1);
        }
        else
        {
            line += "-";
        }
        return line + "\n" + explode(rest, max);
    }
}
