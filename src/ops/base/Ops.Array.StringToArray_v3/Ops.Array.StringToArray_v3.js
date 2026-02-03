const
    text = op.inStringEditor("text", "1,2,3"),

    separator = op.inSwitch("Separator", [",", ";", "Line Break", "Tab", "Custom"], ","),
    inCustSep = op.inString("Custom Separator", ""),
    inLines = op.inSwitch("Line Breaks", ["Separator", "Ignore"], "Separator"), // "As Arrays",

    inTypes = op.inSwitch("Type", ["Auto", "Numbers", "Strings"], "Auto"),
    trim = op.inValueBool("Trim", true),

    inReplNan = op.inValueBool("Replace Nan", true),
    inNan = op.inFloat("Replace Nan Value", -1),

    arr = op.outArray("array"),
    parsed = op.outTrigger("Parsed"),
    len = op.outNumber("length");

text.setUiAttribs({ "ignoreBigPort": true });

inLines.onChange =
inCustSep.onChange =
inNan.onChange =
    text.onChange =
    trim.onChange = parse;

separator.onChange =
inTypes.onChange =
inReplNan.onChange = updateUi;

function updateUi()
{
    inCustSep.setUiAttribs({ "greyout": separator.get() != "Custom" });

    inNan.setUiAttribs({ "greyout": !inReplNan.get() || inTypes.get() != "Numbers" });
    inReplNan.setUiAttribs({ "greyout": inTypes.get() != "Numbers" });
    parse();
}

updateUi();

function parse()
{
    if (!text.get())
    {
        arr.setRef([]);
        len.set(0);
        return;
    }

    let textInput = text.get();

    if (trim.get() && textInput)
    {
        textInput = textInput.replace(/^\s+|\s+$/g, "");
        textInput = textInput.trim();
    }
    let type = 0;
    if (inTypes.get() === "Numbers")type = 1;
    if (inTypes.get() === "Strings")type = 2;

    let r;
    let sep = separator.get();

    if (separator.get() === "Line Break") sep = "\n";
    if (separator.get() === "Tab") sep = "\t";
    if (separator.get() == "Custom")sep = inCustSep.get();

    r = textInput.split(sep);

    if (inLines.get() == "Separator")
    {
        textInput = r.join("\n");
        r = textInput.split("\n");
    }

    if (r[r.length - 1] === "") r.length -= 1;

    len.set(r.length);

    if (trim.get())
    {
        for (let i = 0; i < r.length; i++)
        {
            r[i] = r[i].replace(/^\s+|\s+$/g, "");
            r[i] = r[i].trim();
        }
    }

    op.setUiError("notnum", null);
    if (type === 0) // auto
    {
        for (let i = 0; i < r.length; i++)
        {
            if (!CABLES.isNumeric(r[i]))r[i] = String(r[i]);
            else r[i] = Number(r[i]);
        }
    }
    if (type === 1) // numbers
    {
        let hasStrings = false;
        for (let i = 0; i < r.length; i++)
        {
            r[i] = Number(r[i]);
            if (!CABLES.isNumeric(r[i]))
            {
                if (inReplNan.get()) r[i] = inNan.get();
                hasStrings = true;
            }
        }
        if (hasStrings)
        {
            op.setUiError("notnum", "Parse Error / Not all values numerical!", 1);
        }
    }
    if (type === 2) // strings
    {
        for (let i = 0; i < r.length; i++)
        {
            r[i] = String(r[i]);
        }
    }

    arr.setRef(r);
    parsed.trigger();
}
