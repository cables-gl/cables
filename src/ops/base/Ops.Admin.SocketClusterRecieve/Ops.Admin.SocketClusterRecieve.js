const inSocket = op.inObject("socket");
const inTopic = op.inString("topic", "main");
const outData = op.outNumber("data");
const clientIdOut = op.outString("client id");

const init = () =>
{
    const socket = inSocket.get();
    if (socket)
    {
        (async () =>
        {
            const channel = socket.subscribe(socket.channelName);
            for await (const obj of channel)
            {
                if (obj.clientId != socket.clientId && obj.topic == inTopic.get())
                {
                    outData.set(obj.payload);
                    clientIdOut.set(obj.clientId);
                }
            }
        })();
    }
};

inSocket.onChange = init;
