var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var x=op.addInPort(new Port(op,"value x",OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"value y",OP_PORT_TYPE_VALUE));
var z=op.addInPort(new Port(op,"value z",OP_PORT_TYPE_VALUE));

var resultX=op.addOutPort(new Port(op,"result x"));
var resultY=op.addOutPort(new Port(op,"result y"));
var resultZ=op.addOutPort(new Port(op,"result z"));

function frame(time)
{
    exec();
}

function exec()
{
    if(resultX.get()!=x.get()) resultX.set(x.get());
    if(resultY.get()!=y.get()) resultY.set(y.get());
    if(resultZ.get()!=z.get()) resultZ.set(z.get());
}

exe.onTriggered=exec;

x.onValueChanged=exec;
y.onValueChanged=exec;
z.onValueChanged=exec;
