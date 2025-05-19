const
    data = op.inObject("data"),
    key = op.inString("key"),
    result = op.outArray("result"),
    arrLength = op.outNumber("Length");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;
op.setUiAttrib({ "extendTitlePort": key.name });
key.setUiAttribs({ "stringTrim": true });

op.toWorkPortsNeedsString(key);

data.onChange =
    key.onChange = update;

key.on("change", updateUi);
updateUi();
function updateUi()
{
    if (!key.get())op.setUiError("nokey", "Missing Key Value", 1);
    else op.setUiError("nokey", null);
}

function update()
{
    const dat = data.get();
    const k = key.get();
    if (dat && (dat.hasOwnProperty(k) || dat[k]))
    {
        result.setRef(dat[k]);
        if (!result.get())
        {
            arrLength.setRef(0);
        }
        else
        {
            arrLength.setRef(result.get().length);
        }
    }
    else
    {
        result.setRef([]);
        arrLength.set(0);
    }
}
