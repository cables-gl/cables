op.name="DelayedTrigger";

var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var delay=op.addInPort(new Port(op,"delay",CABLES.OP_PORT_TYPE_VALUE));

var next=op.addOutPort(new Port(op,"next",CABLES.OP_PORT_TYPE_FUNCTION));

delay.set(1);

var lastTimeout=null;

exe.onTriggered=function()
{
    if(lastTimeout)clearTimeout(lastTimeout);
    lastTimeout=setTimeout(
        function()
        {
            lastTimeout=null;
            next.trigger();
        }, 
        delay.get()*1000);
};