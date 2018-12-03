const r=op.addInPort(new CABLES.Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
const g=op.addInPort(new CABLES.Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
const b=op.addInPort(new CABLES.Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
const a=op.addInPort(new CABLES.Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

const outR=op.outValue("outr");
const outG=op.outValue("outg");
const outB=op.outValue("outb");
const outA=op.outValue("outa");
const outHex = op.outValue('Hex', '000000');
const arrOut=op.outArray("Array");

r.onChange=exec;
g.onChange=exec;
b.onChange=exec;
a.onChange=exec;

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

arrOut.set([r.get(),g.get(),b.get(),]);
