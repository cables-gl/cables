const inSocket = op.inObject("socket", null, "socketcluster");
const inTopic = op.inString("topic", "main");
const inReceiveOwn = op.inBool("Receive Own Data", false);
const inNamedTrigger = op.inBool("Use named Trigger", false);
const clientIdOut = op.outString("client id");
const triggerNameOut = op.outString("Trigger name");
const outTrigger = op.outTrigger("received");

const init = () =>
{
    const socket = inSocket.get();
    if (socket)
    {
        (async () =>
        {
            const channel = socket.subscribe(socket.channelName + "/triggers");
            for await (const obj of channel)
            {
                if (inReceiveOwn.get() || obj.clientId != socket.clientId && obj.topic == inTopic.get())
                {
                    clientIdOut.set(obj.clientId);
                    if (inNamedTrigger.get() && obj.payload)
                    {
                        sendNamedTrigger(obj.payload);
                    }
                    triggerNameOut.set(obj.payload);
                    outTrigger.trigger();
                }
            }
        })();
    }
};

function sendNamedTrigger(name)
{
    const arr = op.patch.namedTriggers[name];
    // fire an event even if noone is receiving this trigger
    // this way TriggerReceiveFilter can still handle it
    op.patch.emitEvent("namedTriggerSent", name);

    if (!arr)
    {
        op.logError("unknown trigger array!", name);
        return;
    }

    for (let i = 0; i < arr.length; i++)
    {
        arr[i]();
    }
}

inSocket.onChange = init;
