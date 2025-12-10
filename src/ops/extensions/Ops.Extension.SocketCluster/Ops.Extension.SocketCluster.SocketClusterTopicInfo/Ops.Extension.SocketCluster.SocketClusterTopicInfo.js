const inSocket = op.inObject("Socket", null, "socketcluster"),
    inTopic = op.inString("Topic", "main"),
    inTimeout = op.inInt("Timeout", 20000),
    inSoftTimeout = op.inInt("Soft Timeout", 15000),
    inRetain = op.inInt("Retain Messages", 1),
    inUpdate = op.inTriggerButton("Update"),
    receiveMyData = op.inBool("Receive My Data", true),
    outActive = op.outArray("Active Clients"),
    outSoftTimeout = op.outObject("Will Time Out"),
    outTimeout = op.outArray("Timed Out Clients"),
    outMessages = op.outObject("Messages"),
    outTrigger = op.outTrigger("Updated");

const activeClients = {};
const clientLastTimestamps = {};

let willTimeoutClients = {};
let timedOutClients = [];

let newClient = false;

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

        Object.keys(channels)
            .forEach((key) =>
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
    if (receiveMyData.get() || msg.clientId !== socket.clientId)
        if (msg.topic === inTopic.get())
        {
            if (!activeClients.hasOwnProperty(msg.clientId))
            {
                activeClients[msg.clientId] = [];
                newClient = true;
            }
            const timestamp = Date.now();
            const clientData = {
                "type": type,
                "timestamp": timestamp,
                "payload": msg.payload
            };
            activeClients[msg.clientId].push(clientData);
            clientLastTimestamps[msg.clientId] = Date.now();
            cleanupClients(newClient);
        }
};

const cleanupClients = () =>
{
    let activeClientsChanged = newClient;
    let willTimeoutClientsChanged = false;
    let timedOutClientsChanged = false;
    let messagesChanged = false;

    const now = Date.now();
    const timeout = inTimeout.get();
    const softTimeout = inSoftTimeout.get();
    Object.keys(clientLastTimestamps)
        .forEach((clientId) =>
        {
            const clientTimestamp = clientLastTimestamps[clientId];
            if (clientTimestamp <= (now - timeout))
            {
                if (activeClients.hasOwnProperty(clientId))
                {
                    delete activeClients[clientId];
                    timedOutClients.push(clientId);
                    activeClientsChanged = true;
                }
                if (willTimeoutClients.hasOwnProperty(clientId))
                {
                    delete willTimeoutClients[clientId];
                    willTimeoutClientsChanged = true;
                }
                delete clientLastTimestamps[clientId];
            }
            else if (clientTimestamp <= (now - softTimeout))
            {
                const progressToTimeout = (now - clientTimestamp) / timeout;
                willTimeoutClients[clientId] = {
                    "lastMessage": clientTimestamp,
                    "timeoutAt": clientTimestamp + timeout,
                    "progress": progressToTimeout
                };
                willTimeoutClientsChanged = true;
            }
            else
            {
                if (willTimeoutClients.hasOwnProperty(clientId))
                {
                    delete willTimeoutClients[clientId];
                    willTimeoutClientsChanged = true;
                }
                if (timedOutClients.includes(clientId))
                {
                    timedOutClients = timedOutClients.filter((value) => { return value !== clientId; });
                    timedOutClientsChanged = true;
                }
            }
        });
    if (inRetain.get() > 0)
    {
        const clientIds = Object.keys(activeClients);
        for (let i = 0; i < clientIds.length; i++)
        {
            const clientId = clientIds[i];
            const shift = activeClients[clientId].length - inRetain.get();
            for (let j = 0; j < shift; j++)
            {
                activeClients[clientId].shift();
                messagesChanged = true;
            }
        }
    }
    let changed = false;
    if (activeClientsChanged)
    {
        outActive.set(null);
        outActive.set(Object.keys(activeClients));
        changed = true;
        newClient = false;
    }
    if (messagesChanged)
    {
        outMessages.set(null);
        outMessages.set(activeClients);
        changed = true;
    }
    if (willTimeoutClientsChanged)
    {
        outSoftTimeout.set(null);
        outSoftTimeout.set(willTimeoutClients);
        changed = true;
    }
    if (timedOutClientsChanged)
    {
        outTimeout.set(null);
        outTimeout.set(timedOutClients);
        changed = true;
    }
    if (changed)
    {
        outTrigger.trigger();
    }
};

inUpdate.onTriggered = cleanupClients;
inSocket.onChange = init;

inTimeout.onChange = inSoftTimeout.onChange = () =>
{
    if (inTimeout.get() < inSoftTimeout.get())
    {
        op.setUiError("timeout", "softtimeout should be smaller than timeout", 1);
    }
    else
    {
        op.setUiError("timeout", null);
    }
};
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
