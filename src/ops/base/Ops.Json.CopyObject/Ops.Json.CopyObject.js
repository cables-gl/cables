const
    inp = op.inObject("Input"),
    active = op.inBool("Active", true),
    out = op.outObject("Output"),
    outValid = op.outBoolNum("Valid");

inp.onChange =
    active.onChange = () =>
    {
        if (!active.get()) return;

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
