const mqttObj = op.inObject("MQTT Object");
const message = op.inValue("Message", "Hello Cables");
const channel = op.inString("Channel", "/test");
const send = op.inTriggerButton("Send");

const mqttOutObj = op.outObject("MQTT Object - Out");

send.onTriggered = function ()
{
    const o = mqttObj.get();
    if (o && o.requestSend)
    {
        o.requestSend(String(message.get()), channel.get());
    }
    else
    {
        op.log("MQTTSend Error: Could not send, MQTT object not defined / not complete");
    }
    // inform others on change
    mqttOutObj.set(o);
};
