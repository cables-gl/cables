const
    inMessage=op.inObject("Message"),
    inAddress=op.inString("Address"),
    learn=op.inTriggerButton("Learn"),
    outMsg=op.outObject("Message"),
    outArray=op.outArray("Array out"),
    outArrayLength=op.outNumber("Array length");
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
        outArray.set(null);
        outArrayLength.set(0);
        return;
    }
    else
    {
        outArray.set(msg.v);
        outArrayLength.set(msg.v.length);
        outTrig.trigger();
    }

    outMsg.set(msg);

};