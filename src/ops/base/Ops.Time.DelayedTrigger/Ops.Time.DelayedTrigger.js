const
    exe=op.inTrigger("exe"),
    delay=op.inValueFloat("delay",1),
    next=op.outTrigger("next");

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