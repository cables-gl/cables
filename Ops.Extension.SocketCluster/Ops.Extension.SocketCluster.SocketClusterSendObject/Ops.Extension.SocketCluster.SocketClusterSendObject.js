const
    inTrigger = op.inTrigger("send"),
    inSocket = op.inObject("socket", null, "socketcluster"),
    inTopic = op.inString("topic", "main"),
    inData = op.inObject("data"),
    inDelay = op.inInt("delay (ms)", 0),
    outTrigger = op.outTrigger("Sent Data");

op.toWorkPortsNeedToBeLinked(inTrigger, inSocket, inData);

const send = () =>
{
    const socket = inSocket.get();

    if (!socket) return;

    if (!socket.allowSend)
        op.setUiError("allowsend", "socket is not allowed to send data", 1);
    else op.setUiError("allowsend", null);

    if (socket.channelName && socket.allowSend)
    {
        const payload = Object.assign(socket.commonValues, {
            "topic": inTopic.get(),
            "clientId": socket.clientId,
            "payload": inData.get()
        });
        let delay = 0;
        const localDelay = inDelay.get();
        if (inDelay.get() > 0 || socket.globalDelay > 0)
        {
            delay = socket.globalDelay;
            if (localDelay)
            {
                delay = localDelay;
            }
        }
        setTimeout(() =>
        {
            socket.transmitPublish(socket.channelName + "/objects", payload);
            outTrigger.trigger();
        }, delay);
    }
};

inTrigger.onTriggered = send;
