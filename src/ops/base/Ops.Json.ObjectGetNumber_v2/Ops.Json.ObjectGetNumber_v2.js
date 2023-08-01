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
    const d = data.get();
    if (d)
    {
        const val = d[key.get()];
        result.set(parseFloat(val));
        if (val === undefined) outFound.set(0);
        else outFound.set(1);
    }
    else
    {
        result.set(0);
        outFound.set(0);
    }
}
