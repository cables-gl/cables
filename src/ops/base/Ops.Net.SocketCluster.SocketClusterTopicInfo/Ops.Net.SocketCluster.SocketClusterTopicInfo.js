const inSocket = op.inObject("Socket", null, "socketcluster"),
    inTopic = op.inString("Topic", "main"),
    inTimeout = op.inInt("Timeout", 20000),
    inSoftTimeout = op.inInt("Soft Timeout", 15000),
    inRetain = op.inInt("Retain Messages", 1),
    inUpdate = op.inTriggerButton("Update"),
    outActive = op.outArray("Active Clients"),
    outSoftTimeout = op.outArray("Will Time Out"),
    outTimeout = op.outArray("Timed Out Clients"),
    outMessages = op.outObject("Messages"),
    outTrigger = op.outTrigger("Updated");

const activeClients = {};
const clientLastTimestamps = {};

let willTimeoutClients = [];
let timedOutClients = [];

const init = () =>
{
    const socket = inSocket.get();
    if (socket)
    {
        const channels = {};

        channels.boolean = socket.subscribe(socket.channelName + "/booleans");
        channels.number = socket.subscribe(socket.channelName + "/numbers");
        channels.string = socket.subscribe(socket.channelName + "/strings");
        channels.trigger = socket.subscribe(socket.channelName + "/triggers");
        channels.array = socket.subscribe(socket.channelName + "/arrays");
        channels.object = socket.subscribe(socket.channelName + "/objects");

        Object.keys(channels).forEach((key, index) =>
        {
            (async () =>
            {
                const channel = channels[key];
                for await (const obj of channel)
                {
                    handleMessage(socket, obj, key);
                }
            })();
        });
    }
};

const handleMessage = (socket, msg, type) =>
{
    if (msg.clientId != socket.clientId && msg.topic == inTopic.get())
    {
        if (!activeClients.hasOwnProperty(msg.clientId))
        {
            activeClients[msg.clientId] = [];
        }
        const timestamp = Date.now();
        const clientData = {
            "type": type,
            "timestamp": timestamp,
            "payload": msg.payload
        };
        activeClients[msg.clientId].push(clientData);
        clientLastTimestamps[msg.clientId] = Date.now();
        cleanupClients();
    }
};

const cleanupClients = () =>
{
    let activeClientsChanged = false;
    let willTimeoutClientsChanged = false;
    let timedOutClientsChanged = false;
    let messagesChanged = false;

    const now = Date.now();
    const timeout = inTimeout.get();
    const softTimeout = inSoftTimeout.get();
    Object.keys(clientLastTimestamps).forEach((clientId, index) =>
    {
        const clientTimestamp = clientLastTimestamps[clientId];
        op.log("checking client timestamp", clientTimestamp, clientTimestamp <= (now - timeout), clientLastTimestamps <= (now - softTimeout));
        if (clientTimestamp <= (now - timeout))
        {
            if (activeClients.hasOwnProperty(clientId))
            {
                delete activeClients[clientId];
                timedOutClients.push(clientId);
                activeClientsChanged = true;
                op.log("removing client", clientId);
            }
            if (willTimeoutClients.includes(clientId))
            {
                willTimeoutClients = willTimeoutClients.filter((value) => value !== clientId);
                willTimeoutClientsChanged = true;
            }
            delete clientLastTimestamps[clientId];
        }
        else if (clientTimestamp <= (now - softTimeout))
        {
            if (!willTimeoutClients.includes(clientId))
            {
                willTimeoutClients.push(clientId);
                willTimeoutClientsChanged = true;
                op.log("soft timeout client", clientId);
            }
        }
        else
        {
            if (willTimeoutClients.includes(clientId))
            {
                willTimeoutClients = willTimeoutClients.filter((value) => value !== clientId);
                willTimeoutClientsChanged = true;
            }
            if (timedOutClients.includes(clientId))
            {
                timedOutClients = timedOutClients.filter((value) => value !== clientId);
                timedOutClientsChanged = true;
            }
        }
    });
    if (inRetain.get() > 0)
    {
        Object.keys(activeClients).forEach((clientId) =>
        {
            if (activeClients[clientId].length > inRetain.get())
            {
                while (activeClients[clientId].length > inRetain.get())
                {
                    activeClients[clientId].shift();
                }
                messagesChanged = true;
                activeClientsChanged = true;
            }
        });
    }
    let changed = false;
    if (activeClientsChanged)
    {
        outActive.set(Object.keys(activeClients));
        changed = true;
    }
    if (messagesChanged)
    {
        outMessages.set(activeClients);
        changed = true;
    }
    if (willTimeoutClientsChanged)
    {
        outSoftTimeout.set(willTimeoutClients);
        changed = true;
    }
    if (timedOutClientsChanged)
    {
        outTimeout.set(timedOutClients);
        outSoftTimeout.set(willTimeoutClients);
        changed = true;
    }
    if (changed)
    {
        outTrigger.trigger();
    }
};

inUpdate.onTriggered = cleanupClients;
inSocket.onChange = init;

inRetain.onChange = () =>
{
    if (inRetain.get() < 1)
    {
        op.setUiError("retain", "unable to give information if retain == 0");
    }
    else
    {
        op.setUiError("retain", null);
    }
};
