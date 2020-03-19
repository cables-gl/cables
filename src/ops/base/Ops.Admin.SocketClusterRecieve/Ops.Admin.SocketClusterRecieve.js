const inSocket = op.inObject("socket");
const inChannel = op.inString("channel", "main");
const outData = op.outNumber("data");

const init = () =>
{
    const socket = inSocket.get();
    if (socket)
    {
        (async () =>
        {
            const channel = socket.subscribe("main");
            for await (const obj of channel)
            {
                if ((obj.data.clientId != socket.clientId) && obj.data.channel == inChannel.get())
                {
                    outData.set(obj.data.data);
                }
            }
        })();
    }
};

inSocket.onChange = init;
