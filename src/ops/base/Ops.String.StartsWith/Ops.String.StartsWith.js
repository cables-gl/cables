const
    inStr = op.inString("String"),
    inSearch = op.inString("Search"),
    outResult = op.outBoolNum("Starts with");

inStr.onChange =
inSearch.onChange = () =>
{
    if (!inStr.get() || !inSearch.get())
    {
        outResult.set(false);
        return;
    }
    outResult.set(inStr.get().indexOf(inSearch.get()) == 0);
};
