const exe=op.inTrigger("exe");
var x=op.addInPort(new CABLES.Port(op,"value x",CABLES.OP_PORT_TYPE_VALUE));
var y=op.addInPort(new CABLES.Port(op,"value y",CABLES.OP_PORT_TYPE_VALUE));
var z=op.addInPort(new CABLES.Port(op,"value z",CABLES.OP_PORT_TYPE_VALUE));

var resultX=op.addOutPort(new CABLES.Port(op,"result x"));
var resultY=op.addOutPort(new CABLES.Port(op,"result y"));
var resultZ=op.addOutPort(new CABLES.Port(op,"result z"));

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

x.onChange=exec;
y.onChange=exec;
z.onChange=exec;
