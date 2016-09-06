op.name='RelativeTime';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var result=op.addOutPort(new Port(op,"result"));


var offset=Date.now();
window.performance = (window.performance || {
    
    now: function now(){
        return Date.now() - offset;
    }
});

var startTime=performance.now()/1000.0;

function exec()
{
    result.set( performance.now()/1000.0-startTime );
}

exe.onTriggered=exec;
exec();