const
    data = op.inObject("Data"),
    key = op.inString("Key"),
    result = op.outNumber("Result"),
    outFound = op.outBoolNum("Found");

op.toWorkPortsNeedsString(key);
result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;
op.setUiAttrib({ "extendTitlePort": key.name });
key.setUiAttribs({ "stringTrim": true });

key.onChange =
    data.onChange = exec;

function exec()
{
    const d = data.get();
    if (d)
    {
        const val = d[key.get()];
        result.set(parseFloat(val));
        if (val === undefined) outFound.set(0);
        else outFound.set(1);
    }
    else
    {
        result.set(0);
        outFound.set(0);
    }
}
