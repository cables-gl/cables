let mqttObj = op.inObject("MQTT Object");
let message = op.inValue("Message", "Hello Cables");
let channel = op.inValueString("Channel", "/test");
let send = op.addInPort(new CABLES.Port(this, "Send", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

let mqttOutObj = op.outObject("MQTT Object");

send.onTriggered = function ()
{
    let o = mqttObj.get();
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
