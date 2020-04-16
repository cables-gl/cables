const inData = op.inTrigger("data");
const inSocket = op.inObject("socket");
const inTopic = op.inString("topic", "main");

const send = () =>
{
    const socket = inSocket.get();
    if (socket && socket.channelName && socket.allowSend)
    {
        const payload = { topic: inTopic.get(), clientId: socket.clientId, payload: inData.get() };
        socket.transmitPublish(socket.channelName + "/triggers", payload);
    }
};

inData.onTriggered = send;
