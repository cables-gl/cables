const
    inp = op.inObject("Input"),
    out = op.outObject("Output"),
    outValid = op.outBoolNum("Valid");

inp.onChange = () =>
{
    try
    {
        out.setRef(JSON.parse(JSON.stringify(inp.get())));
        outValid.set(true);
    }
    catch (e)
    {
        out.setRef(null);
        outValid.set(false);
    }
};
