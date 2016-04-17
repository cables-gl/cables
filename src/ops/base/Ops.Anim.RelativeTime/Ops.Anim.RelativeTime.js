op.name='RelativeTime';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var result=op.addOutPort(new Port(op,"result"));
var startTime=Date.now()/1000.0;

function exec()
{
    result.set( Date.now()/1000.0-startTime);
}

exe.onTriggered=exec;
exec();
