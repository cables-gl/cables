const mqttObj = op.inObject("MQTT Object");
const receiveChannel = op.inString("Channel", "/test");

const mqttOutObj = op.outObject("MQTT Object - Out");
const messageString = op.outString("Message String");
const messageFloat = op.outNumber("Message Float");
const messageBool = op.outBool("Message Boolean");

const topic = op.outString("Topic");

const TYPE_DELAY = 300; // wait until calling subscribe / unsubscribe

const lastValueChange = 0;
let lastChannel = null;

function resubscribe()
{
    const o = mqttObj.get();
    if (o && o.connected)
    {
        if (lastChannel)
        {
            o.requestUnsubscribe(lastChannel);
        }
        o.requestSubscribe(receiveChannel.get());
        lastChannel = receiveChannel.get();
    }
    else
    {
        // op.log("MQTTReceive: Could not resubscribe");
    }
}

receiveChannel.onChange = function ()
{
    const now = Date.now();

    if (lastValueChange + TYPE_DELAY < now)
    {
        resubscribe();
    }
    else
    {
        // wait a bit until typing stopped
    }
};

mqttObj.onChange = function ()
{
    const o = mqttObj.get();
    if (o)
    {
        if (o.message)
        {
            if (o.message.destinationName.indexOf(receiveChannel.get()) === 0)
            {
                messageString.set(o.message.payloadString);
                messageFloat.set(parseFloat(o.message.payloadString));
                switch (o.message.payloadString.toLowerCase())
                {
                case "false":
                case "0":
                case "0.0":
                case "":
                    messageBool.set(false);
                    break;
                default:
                    messageBool.set(true);
                }
                topic.set(o.message.destinationName);
            }
            else
            { // message does not fit topic, inform others
                // inform others on change
                mqttOutObj.set(o);
            }
        }
        else
        { // reconnect
            resubscribe();
            // inform others on change
            mqttOutObj.set(o);
        }
    }
    else
    {
        // inform others on change
        mqttOutObj.set(o);
    }
};
