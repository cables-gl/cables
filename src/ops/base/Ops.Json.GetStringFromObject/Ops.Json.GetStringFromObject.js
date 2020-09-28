const
    data = op.inObject("data"),
    key = op.inString("key"),
    result = op.outString("result");

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
    const dat = data.get();
    const theKey = key.get();

    if (dat && dat.hasOwnProperty(theKey)) result.set(dat[theKey]);
    else result.set(null);
}
