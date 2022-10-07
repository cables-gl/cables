const
    data = op.inObject("Data"),
    key = op.inString("Key"),
    result = op.outValue("Result"),
    outFound = op.outBool("Found");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

data.onChange = exec;

key.onChange = function ()
{
    if (!key.isLinked())op.setUiAttrib({ "extendTitle": key.get() });
    exec();
};

function exec()
{
    if (data.get() && data.get().hasOwnProperty(key.get()))
    {
        result.set(data.get()[key.get()]);
        outFound.set(1);
    }
    else
    {
        result.set(null);
        outFound.set(0);
    }
}
