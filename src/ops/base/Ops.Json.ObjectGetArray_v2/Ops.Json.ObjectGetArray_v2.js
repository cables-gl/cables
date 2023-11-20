const
    data = op.inObject("data"),
    key = op.inString("key"),
    result = op.outArray("result"),
    arrLength = op.outNumber("Length");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;
op.setUiAttrib({ "extendTitlePort": key.name });

data.onChange =
    key.onChange = update;

key.on("change", updateUi);
updateUi();
function updateUi()
{
    if (!key.get())op.setUiError("nokey", "Missing Key Value");
    else op.setUiError("nokey", null);
}

function update()
{
    result.set(null);
    const dat = data.get();
    const k = key.get();
    if (dat && (dat.hasOwnProperty(k) || dat[k]))
    {
        result.setRef(dat[k]);
        if (!result.get())
        {
            arrLength.set(0);
        }
        else
        {
            arrLength.set(result.get().length);
        }
    }
    else
    {
        arrLength.set(0);
    }
}
