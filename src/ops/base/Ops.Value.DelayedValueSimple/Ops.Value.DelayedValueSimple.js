let val = op.inValue("Value");
let de = op.inValue("Delay", 1);

let outVal = op.outValue("Out Value");

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
