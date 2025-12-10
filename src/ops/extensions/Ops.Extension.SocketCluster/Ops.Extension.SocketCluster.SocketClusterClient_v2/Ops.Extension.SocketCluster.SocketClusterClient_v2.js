 const
    channelName = op.inString("Channel", "changeme"),
    serverHostname = op.inString("Server hostname", "socket.cables.gl"),
    serverPort = op.inValue("Server port", 443),
    serverSecure = op.inBool("Use SSL", true),
    serverPath = op.inString("Server path", "/socketcluster/"),
    allowSend = op.inBool("Allow send", true),
    allowMultipleSenders = op.inBool("Allow multiple senders", true),
    globalDelay = op.inInt("Delay send (ms)", 0),
    commonValues = op.inObject("Additional serverdata", {}),
    activeIn = op.inBool("Active", true),
    ready = op.outBool("Ready", false),
    socketOut = op.outObject("Socket", null, "socketcluster"),
    clientIdOut = op.outString("Own client id"),
    sendOut = op.outBool("Can send", false),
    errorOut = op.outString("Error", null);

let socket = null;

op.setPortGroup("Server",[serverHostname,serverSecure,serverPort,serverPath]);

op.init =
    activeIn.onChange =
    serverHostname.onChange =
    serverPath.onChange =
    serverPort.onChange =
    serverSecure.onChange =
    initSoon;

function updateUi()
{
    let state="disconnected";

    if(ready.get())state="connected";
    op.setUiAttrib({ "extendTitle": state});
}

let toInit=null;
function initSoon()
{
    clearTimeout(toInit);
    toInit=setTimeout(()=>
    {
        init();
    },100);
}

function init()
{
    errorOut.set("");
    op.setUiError("catcherr", null);

    if (activeIn.get())
    {
        if (socket) disconnect();

        try
        {
            socket = socketClusterClient.create({
                "hostname": serverHostname.get(),
                "secure": serverSecure.get(),
                "port": serverPort.get(),
                "path": serverPath.get(),
                "autoReconnect":true,
                "autoReconnectOptions":{"initialDelay":1000,"randomness":0,"multiplier":1}
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
                    op.setUiError("connectionError", error.message + " (" + error.name + ")", 1);
                    errorOut.set(error.name);
                    ready.set(false);
                    updateUi()
                }
            })();
            (async () =>
            {
                for await (const event of socket.listener("connect"))
                {
                    op.setUiError("connectionError", null);
                    op.setUiError("catc2herr", null);
                    ready.set(true);
                    socketOut.setRef(socket);
                    updateUi()
                }
            })();

            // subscribe to controlmessages
            (async () =>
            {
                try
                {
                    const channel = socket.subscribe(channelName.get() + "/control");
                    for await (const obj of channel)
                    {
                        if (obj.clientId != socket.clientId)
                        {
                            handleControlMessage(obj);
                        }
                    }
                }
                catch(e)
                {
                    op.setUiError("catcherr", e.message);
                }
            })();

            serverHostname.onChange = init;
            serverPort.onChange = init;
            serverSecure.onChange = init;
            updateUi()
        }
        catch(e)
        {
            op.setUiError("catcherr", e.message);
        }

    }
    else if (!activeIn.get())
    {
        disconnect();
    }
}
function disconnect()
{
    if (socket)
    {
        socket.disconnect();
        ready.set(false);
        socket = null;
        updateUi();
    }

}

globalDelay.onChange = () =>
{
    if (socket)
    {
        socket.globalDelay = globalDelay.get();
        socketOut.setRef(socket);
    }
};

allowSend.onChange = () =>
{
    if (socket)
    {
        socket.allowSend = allowSend.get();
        socketOut.setRef(socket);
        sendOut.set(allowSend.get());
        const payload = Object.assign(socket.commonValues, {
            "topic": "cablescontrol",
            "clientId": socket.clientId,
            "payload": { "allowSend": allowSend.get() }
        });
        socket.transmitPublish(channelName.get() + "/control", payload);
    }
};

channelName.onChange = () =>
{
    if (socket)
    {
        socket.unsubscribe(socket.channelName + "/control");
        socket.channelName = channelName.get();
        socketOut.setRef(socket);

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
        socketOut.setRef(socket);
    }
};

const handleControlMessage = (message) =>
{
    // other client wants to take over control, switch state if multiple senders are not allowed
    if (message.payload.allowSend && !allowMultipleSenders.get())
    {
        socket.allowSend = false;
        socketOut.setRef(socket);
        sendOut.set(false);
    }
};


op.onDelete = () =>
{
    disconnect();
};
