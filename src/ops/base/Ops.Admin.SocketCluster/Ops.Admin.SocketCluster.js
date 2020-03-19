const serverHostname = op.inString("server hostname", "ws.dev.cables.gl");
const allowSend = op.inBool("allow send", false);
const channelName = op.inString("channel", op.patchId);
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
    socket.channelName = channelName.get();
    sendOut.set(allowSend.get());
    console.info("socketcluster clientId", socket.clientId);
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
};

allowSend.onChange = () =>
{
    if (socket)
    {
        socket.allowSend = allowSend.get();
        socketOut.set(socket);
        sendOut.set(allowSend.get());
        const payload = { topic: "cablescontrol", clientId: socket.clientId, payload: { allowSend: allowSend.get() } };
        socket.transmitPublish(channelName.get() + "/control", payload);
    }
};

channelName.onChange = () =>
{
    if (socket)
    {
        socket.channelName = channelName.get();
        socketOut.set(socket);

        // subscribe to controllmessages for this channel
        (async () =>
        {
            const channel = socket.subscribe(channelName.get() + "/control");
            for await (const obj of channel)
            {
                if (obj.clientId != socket.clientId)
                {
                    handleControlMessage(obj);
                }
            }
        })();
    }
};

const handleControlMessage = (message) =>
{
    // other client wants to take over control, switch state
    if (message.payload.allowSend)
    {
        socket.allowSend = false;
        socketOut.set(socket);
        sendOut.set(false);
    }
};

init();
