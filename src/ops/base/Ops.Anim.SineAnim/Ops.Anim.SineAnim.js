var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var result=op.addOutPort(new CABLES.Port(op,"result"));

var phase=op.addInPort(new CABLES.Port(op,"phase",CABLES.OP_PORT_TYPE_VALUE));
var mul=op.addInPort(new CABLES.Port(op,"frequency",CABLES.OP_PORT_TYPE_VALUE));
var amplitude=op.addInPort(new CABLES.Port(op,"amplitude",CABLES.OP_PORT_TYPE_VALUE));

mul.set(1.0);
amplitude.set(1.0);
phase.set(1);
exe.onTriggered=exec;
exec();

function exec()
{
    result.set( amplitude.get() * Math.sin( (op.patch.freeTimer.get()*mul.get()) + phase.get() ));
}

