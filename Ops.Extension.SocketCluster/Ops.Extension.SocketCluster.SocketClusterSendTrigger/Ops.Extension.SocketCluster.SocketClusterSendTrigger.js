const inData = op.inTrigger("data");
const inSocket = op.inObject("socket", null, "socketcluster");
const inTopic = op.inString("topic", "main");
const inTriggerName = op.inString("Trigger Name");
const inDelay = op.inInt("delay (ms)", 0);

const send = () =>
{
    const socket = inSocket.get();
    if (socket && socket.channelName && socket.allowSend)
    {
        let triggerName = 0;
        if (inTriggerName.get())
        {
            triggerName = inTriggerName.get();
        }
        const payload = Object.assign(socket.commonValues, { "topic": inTopic.get(), "clientId": socket.clientId, "payload": triggerName });
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
            socket.transmitPublish(socket.channelName + "/triggers", payload);
        }, delay);
    }
};

inData.onTriggered = send;
