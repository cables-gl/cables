const inSocket = op.inObject("socket");
const inTopic = op.inString("topic", "main");
const clientIdOut = op.outString("client id");
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
                if (obj.clientId != socket.clientId && obj.topic == inTopic.get())
                {
                    clientIdOut.set(obj.clientId);
                    outTrigger.trigger();
                }
            }
        })();
    }
};

inSocket.onChange = init;
