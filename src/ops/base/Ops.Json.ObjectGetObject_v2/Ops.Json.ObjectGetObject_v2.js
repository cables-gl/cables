const
    data = op.inObject("Object"),
    key = op.inString("Key"),
    result = op.outObject("Result");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

op.setUiAttrib({ "extendTitlePort": key.name });

key.onChange =
    data.onChange = update;

key.on("change", updateUi);
updateUi();
function updateUi()
{
    if (!key.get())op.setUiError("nokey", "Missing Key Value");
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
