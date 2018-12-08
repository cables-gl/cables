const exe=op.inTrigger("exe");
var delay=op.addInPort(new CABLES.Port(op,"delay",CABLES.OP_PORT_TYPE_VALUE));

const next=op.outTrigger("next");

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