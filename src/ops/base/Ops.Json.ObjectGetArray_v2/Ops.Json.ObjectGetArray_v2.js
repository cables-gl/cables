const
    data = op.inObject("data"),
    key = op.inString("key"),
    result = op.outArray("result"),
    arrLength = op.outValue("Length");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

data.onChange = update;

key.onChange = function ()
{
    op.setUiAttrib({ "extendTitle": key.get() });
    update();
};

function update()
{
    console.log(data.get());
    result.set(null);
    const dat = data.get();
    const k = key.get();
    if (dat && (dat.hasOwnProperty(k) || dat[k]))
    {
        result.set(dat[k]);
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
