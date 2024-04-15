const inSocket = op.inObject("socket", null, "socketcluster");
const inTopic = op.inString("topic", "main");
const inReceiceOwn=op.inBool("Receive Own Data",false);
const clientIdOut = op.outString("client id");
const outData = op.outObject("data");
const outTrigger = op.outTrigger("received");

const init = () =>
{
    const socket = inSocket.get();
    if (socket)
    {
        (async () =>
        {
            const channel = socket.subscribe(socket.channelName + "/objects");
            for await (const obj of channel)
            {

                if ( obj.topic == inTopic.get())
                {

                    if(inReceiceOwn.get() || obj.clientId != socket.clientId)
                    {
                        outData.set(obj.payload);
                        clientIdOut.set(obj.clientId);
                        outTrigger.trigger();

                    }
                }
            }
        })();
    }
};

inSocket.onChange = init;
