const
    inMessage=op.inObject("Message"),
    inAddress=op.inString("Address"),
    learn=op.inTriggerButton("Learn"),
    outMsg=op.outObject("Message"),
    outValue=op.outNumber("Value"),
    outTrig=op.outTrigger("Received");

var learning = false;
learn.onTriggered = function() { learning = true; };

inMessage.onChange=function()
{
    const msg=inMessage.get();

    if(learning)
    {
        if(msg && msg.a)
        {
            inAddress.set(msg.a);
            learning=false;
            if(CABLES.UI && gui.patch().isCurrentOp(op)) gui.patch().showOpParams(op);
            return;
        }
        return;
    }

    if(!msg || !msg.a || msg.a!=inAddress.get())
    {
        return;
    }
    else
    {
        outValue.set(msg.v[0]);
        outTrig.trigger();
    }

    outMsg.set(msg);

};