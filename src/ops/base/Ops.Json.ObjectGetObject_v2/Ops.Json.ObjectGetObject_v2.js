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
