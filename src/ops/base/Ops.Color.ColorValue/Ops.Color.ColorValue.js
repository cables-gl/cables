const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
r.setUiAttribs({ "colorPick": true });
const a = op.inValueSlider("a", 1);

const outR = op.outNumber("outr");
const outG = op.outNumber("outg");
const outB = op.outNumber("outb");
const outA = op.outNumber("outa");
const outHex = op.outNumber("Hex", "000000");
const arrOut = op.outArray("Array");

r.onChange = g.onChange = b.onChange = a.onChange = exec;

/**
 * Float [0..1] -> Hex String [00..FF]
 */
function floatToHex(f)
{
    let s = Math.round(f * 255).toString(16);
    if (s.length === 1)
    {
        s = "0" + s;
    }
    return s.toUpperCase();
}

function exec()
{
    outR.set(r.get());
    outG.set(g.get());
    outB.set(b.get());
    outA.set(a.get());

    let hex = floatToHex(r.get()) + floatToHex(g.get()) + floatToHex(b.get());
    outHex.set(hex);

    arrOut.set([r.get(), g.get(), b.get(), a.get()]);
}

exec();
