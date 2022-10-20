const
    inVal = op.inValue("Value"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y");

inVal.onChange = update;

function update()
{
    let t = inVal.get();

    let x = Math.cos(t) * Math.pow(Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.sin(t / 12), 2);
    let y = Math.sin(t) * Math.pow(Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.sin(t / 12), 2);

    outX.set(x);
    outY.set(y);
}
