const
    val = op.inFloat("Value"),
    delTrue = op.inFloat("Delay True", 1),
    delFalse = op.inFloat("Delay False", 1),
    outVal = op.outBoolNum("Out Value");

let timeout = -1;

val.onChange =
    delFalse.onChange =
    delTrue.onChange = update;

function update()
{
    clearTimeout(timeout);
    let v = val.get();

    let delay = 1;
    if (v) delay = delTrue.get() * 1000;
    else delay = delFalse.get() * 1000;

    timeout = setTimeout(function ()
    {
        outVal.set(v);
    }, delay);
}
