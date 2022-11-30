const
    data = op.inObject("Data"),
    key = op.inString("Key"),
    result = op.outNumber("Result"),
    outFound = op.outBoolNum("Found");

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
    if (data.get())
    {
        const val = data.get()[key.get()];
        result.set(val);
        if (val === undefined) outFound.set(0);
        else outFound.set(1);
    }
    else
    {
        result.set(null);
        outFound.set(0);
    }
}
