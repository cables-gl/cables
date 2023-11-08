const
    val = op.inString("Value"),
    de = op.inValue("Delay", 1),
    outVal = op.outString("Out Value");

let timeout = -1;

val.onChange =
    de.onChange = update;

function update()
{
    clearTimeout(timeout);
    const v = val.get();
    timeout = setTimeout(function ()
    {
        outVal.set(v);
    }, de.get() * 1000);
}
