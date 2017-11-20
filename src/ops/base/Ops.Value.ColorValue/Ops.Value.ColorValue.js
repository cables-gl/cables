op.name='ColorValue';

var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));

var outR=op.addOutPort(new Port(op,"outr",OP_PORT_TYPE_VALUE));
var outG=op.addOutPort(new Port(op,"outg",OP_PORT_TYPE_VALUE));
var outB=op.addOutPort(new Port(op,"outb",OP_PORT_TYPE_VALUE));
var outA=op.addOutPort(new Port(op,"outa",OP_PORT_TYPE_VALUE));
var arrOut=op.outArray("Array");

r.onValueChanged=exec;
g.onValueChanged=exec;
b.onValueChanged=exec;
a.onValueChanged=exec;

function exec()
{
    outR.set(r.get());
    outG.set(g.get());
    outB.set(b.get());
    outA.set(a.get());
    
    arrOut.set([r.get(),g.get(),b.get()]);
}

arrOut.set([r.get(),g.get(),b.get(),]);
