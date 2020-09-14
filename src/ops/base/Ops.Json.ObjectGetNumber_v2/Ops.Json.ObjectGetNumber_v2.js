const
    data = op.inObject("Data"),
    key = op.inString("Key"),
    result = op.outValue("Result");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

data.onChange = exec;

key.onChange = function ()
{
    op.setUiAttrib({ "extendTitle": key.get() });
    exec();
};

function exec()
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
