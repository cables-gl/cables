const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
r.setUiAttribs({ colorPick: true });
const a=op.inValueSlider("a");

const outR=op.outValue("outr");
const outG=op.outValue("outg");
const outB=op.outValue("outb");
const outA=op.outValue("outa");
const outHex = op.outValue('Hex', '000000');
const arrOut=op.outArray("Array");

r.onChange=g.onChange=b.onChange=a.onChange=exec;

/**
 * Float [0..1] -> Hex String [00..FF]
 */
function floatToHex(f) {
    var s = Math.round(f * 255).toString(16);
    if(s.length === 1) {
        s = '0' + s;
    }
    return s.toUpperCase();
}

function exec()
{
    outR.set(r.get());
    outG.set(g.get());
    outB.set(b.get());
    outA.set(a.get());

    var hex = floatToHex(r.get()) + floatToHex(g.get()) + floatToHex(b.get());
    outHex.set(hex);

    arrOut.set([r.get(),g.get(),b.get()]);
}

exec();