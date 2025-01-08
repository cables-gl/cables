const
    data = op.inObject("Object"),
    key = op.inString("Key"),
    result = op.outObject("Result");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;
op.toWorkPortsNeedsString(key);

op.setUiAttrib({ "extendTitlePort": key.name });
key.setUiAttribs({ "stringTrim": true });

key.onChange =
    data.onChange = update;

updateUi();
function updateUi()
{
    if (!key.get())op.setUiError("nokey", "Missing Key Value", 1);
    else op.setUiError("nokey", null);
}

function update()
{
    if (data.get())
    {
        result.setRef(data.get()[key.get()]);
    }
    else
    {
        result.set(null);
    }
}
