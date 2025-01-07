const
    data = op.inObject("data"),
    key = op.inString("Key"),
    result = op.outString("Result");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

op.toWorkPortsNeedsString(key);

op.setUiAttrib({ "extendTitlePort": key.name });
key.setUiAttribs({ "stringTrim": true });

key.onChange =
data.onChange = exec;

function exec()
{
    if (data.get())
    {
        const value = data.get()[key.get()];
        const isNull = value === undefined || value === null;

        if (isNull)
        {
            result.setRef(null);
        }
        else
        {
            result.set(String(value));
        }
    }
    else
    {
        result.setRef(null);
    }
}
