const
    data = op.inObject("data"),
    key = op.inString("Key"),
    result = op.outString("Result"),
    found = op.outBoolNum("Found");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

op.toWorkPortsNeedsString(key);
op.toWorkPortsNeedToBeLinked(data);

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
            result.set("");
            found.set(false);
        }
        else
        {
            result.set(String(value));
            found.set(true);
        }
    }
    else
    {
        result.set("");
        found.set(false);
    }
}
