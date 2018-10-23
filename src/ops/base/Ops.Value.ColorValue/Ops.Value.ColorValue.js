op.name='ColorValue';

var r=op.addInPort(new Port(op,"r",CABLES.OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"g",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));

var outR=op.addOutPort(new Port(op,"outr",CABLES.OP_PORT_TYPE_VALUE));
var outG=op.addOutPort(new Port(op,"outg",CABLES.OP_PORT_TYPE_VALUE));
var outB=op.addOutPort(new Port(op,"outb",CABLES.OP_PORT_TYPE_VALUE));
var outA=op.addOutPort(new Port(op,"outa",CABLES.OP_PORT_TYPE_VALUE));
var outHex = op.outValue('Hex', '000000');
var arrOut=op.outArray("Array");

r.onValueChanged=exec;
g.onValueChanged=exec;
b.onValueChanged=exec;
a.onValueChanged=exec;

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
