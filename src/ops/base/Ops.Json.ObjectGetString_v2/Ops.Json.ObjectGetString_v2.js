const
    data = op.inObject("data"),
    key = op.inString("Key"),
    returnKeyIn = op.inBool("Output Key if missing", false),
    result = op.outString("Result"),
    found = op.outBoolNum("Found");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

op.toWorkPortsNeedsString(key);
op.toWorkPortsNeedToBeLinked(data);

op.setUiAttrib({ "extendTitlePort": key.name });
key.setUiAttribs({ "stringTrim": true });

key.onChange =
returnKeyIn.onChange =
data.onChange = exec;

function exec()
{
    let resultString = "";
    let keyFound = false;
    if (returnKeyIn.get())
    {
        resultString = key.get();
    }
    if (data.get())
    {
        const value = data.get()[key.get()];
        const isNull = value === undefined || value === null;

        if (!isNull)
        {
            resultString = String(value);
            keyFound = true;
        }
    }

    result.set(resultString);
    found.set(keyFound);
}
