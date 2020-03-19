const inTrigger = op.inTrigger("send");
const inSocket = op.inObject("socket");
const inChannel = op.inString("channel", "main");
const inData = op.inValue("data");

const send = () =>
{
    const socket = inSocket.get();
    if (socket && socket.allowSend)
    {
        const payload = { channel: inChannel.get(), clientId: socket.clientId, data: inData.get() };
        socket.transmit("main", payload);
    }
};

const validateChannelName = () =>
{
    const input = inChannel.get();
    if (input === "cablescontrol")
    {
        op.setUiError("channelname", "illegal channelname: " + input);
    }
    else
    {
        op.setUiError("channelname", null);
        inChannel.set(input);
    }
};
inTrigger.onTriggered = send;
inData.onChange = send;
inChannel.onChange = validateChannelName;
