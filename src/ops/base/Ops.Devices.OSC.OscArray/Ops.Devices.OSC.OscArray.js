const
    inMessage = op.inObject("Message"),
    inAddress = op.inString("Address"),
    learn = op.inTriggerButton("Learn"),
    outMsg = op.outObject("Result Message"),
    outArray = op.outArray("Array out"),
    outArrayLength = op.outNumber("Array length"),
    outTrig = op.outTrigger("Received");

let learning = false;
learn.onTriggered = function () { learning = true; };

inMessage.onChange = function ()
{
    const msg = inMessage.get();

    if (learning)
    {
        if (msg && msg.a)
        {
            inAddress.set(msg.a);
            learning = false;
            op.refreshParams();
            return;
        }
        return;
    }

    if (!msg || !msg.a || msg.a != inAddress.get())
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
