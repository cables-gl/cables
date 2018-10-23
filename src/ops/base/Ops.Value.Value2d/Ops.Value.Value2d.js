var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var x=op.addInPort(new Port(op,"value x",CABLES.OP_PORT_TYPE_VALUE));
var y=op.addInPort(new Port(op,"value y",CABLES.OP_PORT_TYPE_VALUE));

var resultX=op.addOutPort(new Port(op,"result x"));
var resultY=op.addOutPort(new Port(op,"result y"));

function frame(time)
{
    updateAnims();
    exec();
}

function exec()
{
    if(resultX.get()!=x.get()) resultX.set(x.get());
    if(resultY.get()!=y.get()) resultY.set(y.get());
}

exe.onTriggered=exec;

x.onValueChanged=exec;
y.onValueChanged=exec;

