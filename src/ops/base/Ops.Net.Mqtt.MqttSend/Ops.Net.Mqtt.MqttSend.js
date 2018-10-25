op.name="MqttSend";

var mqttObj = op.inObject("MQTT Object");
var message = op.inValue("Message", "Hello Cables");
var channel = op.inValueString("Channel", "/test");
var send = op.addInPort( new CABLES.Port( this, "Send",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));

var mqttOutObj = op.outObject("MQTT Object");

send.onTriggered = function(){
    var o = mqttObj.get();
    if(o && o.requestSend) {
        o.requestSend(String(message.get()), channel.get());
    } else {
        op.log("MQTTSend Error: Could not send, MQTT object not defined / not complete");
    }
    // inform others on change
    mqttOutObj.set(o);
};
