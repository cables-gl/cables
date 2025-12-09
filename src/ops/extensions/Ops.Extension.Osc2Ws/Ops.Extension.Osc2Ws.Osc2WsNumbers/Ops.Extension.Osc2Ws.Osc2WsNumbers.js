const
    inMessage = op.inObject("Message in"),
    inAddress = op.inString("Osc Address"),
    learn = op.inTriggerButton("Learn"),
    outMsg = op.outObject("Message through"),
    outTrig = op.outTrigger("Received");

let learning = false;
learn.onTriggered = function () { learning = true; };

let numberPorts = [];
for (let i = 0; i < 4; i++)
{
    numberPorts[i] = op.outNumber("Number " + i);
}

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
        return;
    }
    else
    {
        for (var i = 0; i < 3; i++)
        {
            numberPorts[i].set(0);
        }
        for (var i = 0; i < msg.v.length; i++)
        {
            numberPorts[i].set(0);
            numberPorts[i].set(msg.v[i]);
        }
        outTrig.trigger();
    }
    outMsg.set(msg);
};
