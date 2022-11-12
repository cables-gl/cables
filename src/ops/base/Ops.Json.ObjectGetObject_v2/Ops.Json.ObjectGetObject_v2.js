const
    data = op.inObject("Object"),
    key = op.inString("Key"),
    result = op.outObject("Result");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

op.setUiAttrib({ "extendTitlePort": key.name });


key.onChange =
data.onChange = update;

function update()
{
    if (data.get() && data.get().hasOwnProperty(key.get()))
    {
        result.set(data.get()[key.get()]);
    }
    else
    {
        result.set(null);
    }
}
