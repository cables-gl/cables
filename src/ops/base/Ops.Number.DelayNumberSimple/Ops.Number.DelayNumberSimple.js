const
    val = op.inValue("Value"),
    de = op.inValue("Delay", 1),
    outVal = op.outNumber("Out Value");

let timeout = -1;

val.onChange = update;
de.onChange = update;

function update()
{
    clearTimeout(timeout);
    let v = val.get();
    timeout = setTimeout(function ()
    {
        outVal.set(v);
    }, de.get() * 1000);
}
