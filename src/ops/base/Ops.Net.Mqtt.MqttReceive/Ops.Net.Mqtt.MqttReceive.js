const mqttObj = op.inObject("MQTT Object");
const receiveChannel = op.inValueString("Channel", "/test");
const messageType = op.inValueSelect("Message Type", ["String", "Number", "Boolean"], "String");

const mqttOutObj = op.outObject("MQTT Object");
const message = op.outValue("Message");
const topic = op.outValue("Topic");

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
                if (messageType.get() === "String")
                {
                    message.set(o.message.payloadString);
                }
                else if (messageType.get() === "Number")
                {
                    message.set(parseFloat(o.message.payloadString));
                }
                else if (messageType.get() === "Boolean")
                {
                    switch (o.message.payloadString.toLowerCase())
                    {
                    case "false":
                    case "0":
                    case "0.0":
                    case "":
                        message.set(false);
                        break;
                    default:
                        message.set(true);
                    }
                }

                topic.set(o.message.destinationName);
            // o.message = null; // message cannot be deleted, because then other ops think it's a reconnect
            }
            else
            { // message does not fit topic, inform others
                // inform others on change
                mqttOutObj.set(o);
            }
        }
        else
        { // reconnect
            // subscribe();
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
