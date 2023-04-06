const
    inObj = op.inObject("Object"),
    inStr = op.inString("name", ""),
    inRemoveNull = op.inBool("Remove Null", false),
    outObj = op.outObject("Result");

inObj.onChange =
    inStr.onChange =
    inRemoveNull.onChange = update;

function update()
{
    const obj = JSON.parse(JSON.stringify(inObj.get()));

    filter(obj);

    outObj.setRef(obj);
}

function filter(obj)
{
    for (let i in obj)
    {
        if (inStr.get() && i.indexOf(inStr.get()) !== 0) delete obj[i];
        if (inRemoveNull.get() && obj[i] === null) delete obj[i];

        if (typeof obj[i] == "object") filter(obj[i]);
    }
}
