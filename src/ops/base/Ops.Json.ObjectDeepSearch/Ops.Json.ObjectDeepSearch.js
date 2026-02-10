const
    inObj = op.inObject("Object"),
    inStr = op.inString("Search", ""),
    outObj = op.outObject("Result");

inObj.onChange =
inStr.onChange = () =>
{
    const r = {};
    const o = inObj.get() || {};
    search(inStr.get(), o, r, "");
    outObj.setRef(r);
};

function search(s, o, r, p)
{
    for (const i in o)
    {
        if (String(i).includes(s) ||
        (typeof o[i] == "string" && o[i].includes(s)))
        {
            r[p + "." + i] = o[i];
        }

        if (typeof o[i] == "object")
        {
            search(s, o[i], r, p + "." + i);
        }
    }
}
