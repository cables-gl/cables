const
    inStr = op.inString("String"),
    inCap = op.inBool("Capitalize"),
    outStr = op.outString("Result");

function capitalizeFirstLetter(val)
{
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

inCap.onChange =
inStr.onChange = function ()
{
    if (!inStr.get())outStr.set("");
    else if (inCap.get()) outStr.set(capitalizeFirstLetter(inStr.get()));
    else outStr.set((String(inStr.get())).toUpperCase());
};
