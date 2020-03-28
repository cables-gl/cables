const
    exe=op.inTrigger("exe"),
    delay=op.inValueFloat("delay",1),
    next=op.outTrigger("next"),
    outDelaying=op.outBool("Delaying");

var lastTimeout=null;

exe.onTriggered=function()
{
    outDelaying.set(true);
    if(lastTimeout)clearTimeout(lastTimeout);

    lastTimeout=setTimeout(
        function()
        {
            outDelaying.set(false);
            lastTimeout=null;
            next.trigger();
        },
        delay.get()*1000);
};