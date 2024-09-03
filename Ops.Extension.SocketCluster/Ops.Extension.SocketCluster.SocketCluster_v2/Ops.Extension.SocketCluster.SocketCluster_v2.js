const activeIn = op.inBool("Active", false);
const serverHostname = op.inString("Server hostname", "");
const serverPath = op.inString("Server path", "/socketcluster/");
const serverPort = op.inValue("Server port", 443);
const serverSecure = op.inBool("Use SSL", true);
const allowSend = op.inBool("Allow send", true);
const allowMultipleSenders = op.inBool("Allow multiple senders", true);
const channelName = op.inString("Channel", CABLES.generateUUID());
const globalDelay = op.inInt("Delay send (ms)", 0);
const commonValues = op.inObject("Additional serverdata", {});
const ready = op.outBool("Ready", false);
const socketOut = op.outObject("Socket", null, "socketcluster");
const clientIdOut = op.outString("Own client id");
const sendOut = op.outBool("Can send", false);
const errorOut = op.outObject("Error", null);

let socket = null;
let initDelay = null;

const init = () =>
{
    if (!initDelay && activeIn.get())
    {
        initDelay = setTimeout(() =>
        {
            errorOut.set(null);
            if (socket)
            {
                socket.disconnect();
                socket = null;
            }
            socket = socketClusterClient.create({
                "hostname": serverHostname.get(),
                "secure": serverSecure.get(),
                "port": serverPort.get(),
                "path": serverPath.get()
            });
            socket.allowSend = allowSend.get();
            socket.channelName = channelName.get();
            socket.globalDelay = globalDelay.get();
            socket.commonValues = commonValues.get() || {};
            sendOut.set(allowSend.get());
            clientIdOut.set(socket.clientId);

            (async () =>
            {
                for await (const { error } of socket.listener("error"))
                {
                    op.setUiError("connectionError", `error in socketcluster connection (${error.name})`, 2);
                    // op.logError(error);
                    errorOut.set(error);
                    ready.set(false);
                }
            })();
            (async () =>
            {
                for await (const event of socket.listener("connect"))
                {
                    op.setUiError("connectionError", null);
                    ready.set(true);
                    socketOut.set(socket);
                }
            })();

            // subscribe to controlmessages
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
            serverHostname.onChange = init;
            serverPort.onChange = init;
            serverSecure.onChange = init;
            initDelay = null;
        }, 1000);
    }
    else if (!activeIn.get())
    {
        if (socket)
        {
            socket.disconnect();
            socket = null;
        }
    }
};

globalDelay.onChange = () =>
{
    if (socket)
    {
        socket.globalDelay = globalDelay.get();
        socketOut.set(socket);
    }
};

allowSend.onChange = () =>
{
    if (socket)
    {
        socket.allowSend = allowSend.get();
        socketOut.set(socket);
        sendOut.set(allowSend.get());
        const payload = Object.assign(socket.commonValues, { "topic": "cablescontrol", "clientId": socket.clientId, "payload": { "allowSend": allowSend.get() } });
        socket.transmitPublish(channelName.get() + "/control", payload);
    }
};

channelName.onChange = () =>
{
    if (socket)
    {
        socket.unsubscribe(socket.channelName + "/control");
        socket.channelName = channelName.get();
        socketOut.set(socket);

        // subscribe to controlmessages for this channel
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

commonValues.onChange = () =>
{
    if (socket)
    {
        socket.commonValues = commonValues.get() || {};
        socketOut.set(socket);
    }
};

const handleControlMessage = (message) =>
{
    // other client wants to take over control, switch state if multiple senders are not allowed
    if (message.payload.allowSend && !allowMultipleSenders.get())
    {
        socket.allowSend = false;
        socketOut.set(socket);
        sendOut.set(false);
    }
};

op.init = init;
activeIn.onChange = init;
serverHostname.onChange = serverPath.onChange = serverPort.onChange = serverSecure.onChange = init;
