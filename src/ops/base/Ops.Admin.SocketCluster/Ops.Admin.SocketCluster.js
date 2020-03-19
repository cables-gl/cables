const serverHostname = op.inString("server hostname", "ws.dev.cables.gl");
const allowSend = op.inBool("allow send", false);
const ready = op.outBool("ready", false);
const errorOut = op.outObject("error", null);
const socketOut = op.outObject("socket");
const sendOut = op.outBool("can send", false);

let socket = null;
const init = () =>
{
    errorOut.set(null);
    socket = socketClusterClient.create({
        hostname: serverHostname.get(),
        secure: true,
        port: 443,
    });
    socket.allowSend = allowSend.get();
    sendOut.set(allowSend.get());
    console.log("socketcluster clientId", socket.clientId);
    (async () =>
    {
        for await (const { error } of socket.listener("error"))
        {
            console.error(error);
            errorOut.set(error);
        }
    })();
    (async () =>
    {
        for await (const event of socket.listener("connect"))
        {
            ready.set(true);
            socketOut.set(socket);
        }
    })();
    (async () =>
    {
        const channel = socket.subscribe("cablescontrol");
        for await (const obj of channel)
        {
            if (obj.data.clientId != socket.clientId)
            {
                if (obj.data.data.allowSend)
                {
                    socket.allowSend = false;
                    socketOut.set(socket);
                    sendOut.set(false);
                }
            }
        }
    })();
};

init();
allowSend.onChange = () =>
{
    if (socket)
    {
        socket.allowSend = allowSend.get();
        socketOut.set(socket);
        sendOut.set(allowSend.get());
        const payload = { channel: "cablescontrol", clientId: socket.clientId, data: { allowSend: allowSend.get() } };
        socket.transmit("cablescontrol", payload);
    }
};
