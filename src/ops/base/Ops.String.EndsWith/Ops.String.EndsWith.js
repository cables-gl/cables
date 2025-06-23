const
    inStr = op.inString("String"),
    inSearch = op.inString("Search"),
    outResult = op.outBoolNum("Ends with");

inStr.onChange =
inSearch.onChange = () =>
{
    if (!inStr.get() || !inSearch.get())
    {
        outResult.set(false);
        return;
    }
    outResult.set(inStr.get().endsWith(inSearch.get()));
};
