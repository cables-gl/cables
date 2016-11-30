op.name="Mqtt";

var mqttClientName = op.inValueString("Client Name", "Carolin Cable");
var mqttServer = op.inValueString("Broker URL", "broker.shiftr.io");
var mqttUsername = op.inValueString("Username", "try");
var mqttPassword = op.inValueString("Password", "try");
var mqttPort = op.inValue("Port", 443);
var useSsl = op.inValueBool("Use SSL", true);
var reconnect = op.addInPort( new Port( this, "Reconnect", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));

var outObj = op.outObject("MQTT Object");
var connectedPort = op.outValue("Connected", false);

var TIMEOUT = 5;

var client = null;
var mqttCablesObj = null;
var topicMap = {};

op.onLoaded = function(){
    outObj.set(null);
    initLib();
    connect();
    reconnect.onTriggered = handleReconnect;
};

function initLib(){
    console.log("Initiating MQTT lib");
    client = new Paho.MQTT.Client(mqttServer.get(), mqttPort.get(), mqttClientName.get());
    client.onMessageArrived = onMessageArrived;
}

// called when the client connects
var onConnect = function() {
    op.log("MQTT connection established");
    constructMqttObject();
    //outObj.set(undefined);
    outObj.set(mqttCablesObj);
    connectedPort.set(true);
};

var onFailure = function(res) {
    op.log("MQTT Connection Failure, hit reconnect to try again...");
    op.log(res.errorMessage);
    mqttCablesObj.connected = false;
    outObj.set(null);
    connectedPort.set(false);
};

var onMessageArrived = function(message) {
    constructMqttObject();
    mqttCablesObj.message = message;
    // inform others about change
    outObj.set(null);
    outObj.set(mqttCablesObj);
};

function constructMqttObject(){
    mqttCablesObj = {};
    mqttCablesObj.objectType = "mqtt";
    //mqttCablesObj.client = client;
    mqttCablesObj.requestSubscribe = requestSubscribe;
    mqttCablesObj.requestUnsubscribe = requestUnsubscribe;
    mqttCablesObj.requestSend = requestSend;
    mqttCablesObj.connected = true;
}

function requestSend(message, topic){
    var messageObj = new Paho.MQTT.Message(message);
    messageObj.destinationName = topic;
    try{
        client.send(messageObj);
    } catch(e) {
        op.log("MQTTSend: Could not send message " + message + " to " + topic + ", maybe try to reconnect?!");
    }
}

function requestSubscribe(topic){
    console.log("Reqeust subscribe for: " + topic);
    // already subscribed
    if(topicMap.hasOwnProperty(topic)){
        topicMap[topic]++;
    } else {
        topicMap[topic] = 1;
        try{
            client.subscribe(topic);
        } catch(e) {
            op.log("Could not subscribe: " + e);
        }
    }
}

function requestUnsubscribe(topic){
    // check if topic is subscribed
    if(topicMap.hasOwnProperty(topic)){
        // only one op subscribed this topic, do unsubscribe
        if(topicMap[topic] <= 1) {
            try{
                client.unsubscribe(topic);
            } catch(e) {
                op.log("Could not unsubscribe: " + e);
            }
            delete topicMap[topic];
        } else { // another op subscribed this topic, do not unsubscribe
            topicMap[topic]--;
        }
    } else {
        // not subscribed, do nothing
    }
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    op.log("MQTT Connection Lost... :/");
    op.log("Hit Reconnect-button to try again");
  if (responseObject.errorCode !== 0) {
    op.log("MQTT error message: " + responseObject.errorMessage);
  }
  mqttCablesObj.connected = false;
  outObj.set(null);
  //mqttCablesObj = null;
  connectedPort.set(false);
  connect(); // try again
}

/*
 * Called once after op finished loading, can be triggered by pressing reconnect-button
*/
function connect(){
    op.log("MQTT Trying to connect to broker...");
    outObj.set(null);

    // connect the client with username / password
    if(mqttUsername.get() && mqttUsername.get().trim().length > 0) {
        op.log("with user credentials");
        client.connect({
            onSuccess: onConnect,
            onFailure: onFailure,
            userName: mqttUsername.get(),
            password: mqttPassword.get(),
            useSSL: useSsl.get(),
            timeout: TIMEOUT
        });    
    } else { // connect anonymous
        op.log("anonymous");
        client.connect({
        onSuccess: onConnect,
        onFailure: onFailure,
        useSSL: useSsl.get(),
        timeout: TIMEOUT
    });    
    }
}

function handleReconnect(){
    console.log("Reconnecting...");
    connect();
}
