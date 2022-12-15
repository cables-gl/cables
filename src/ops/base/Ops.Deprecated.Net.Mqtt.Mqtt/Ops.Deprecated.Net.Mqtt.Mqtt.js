const mqttClientName = op.inValueString("Client Name", "Carolin Cable");
const mqttServer = op.inValueString("Broker URL", "broker.shiftr.io");
const mqttUsername = op.inValueString("Username", "try");
const mqttPassword = op.inValueString("Password", "try");
const mqttPort = op.inValue("Port", 443);
const useSsl = op.inValueBool("Use SSL", true);
const reconnect = op.inTriggerButton("Reconnect");

const outObj = op.outObject("MQTT Object");
const connectedPort = op.outValue("Connected", false);

const TIMEOUT = 5;

let client = null;
let mqttCablesObj = null;
const topicMap = {};

function handleReconnect()
{
    op.log("Reconnecting...");
    connect();
}

reconnect.onTriggered = handleReconnect;

op.onLoaded = function ()
{
    op.log("MQTT op loaded");
    outObj.set(null);
    initLib();
    connect();
};

function initLib()
{
    op.log("Initiating MQTT lib");
    client = new Paho.MQTT.Client(mqttServer.get(), mqttPort.get(), mqttClientName.get());
    client.onMessageArrived = onMessageArrived;
}

// called when the client connects
const onConnect = function ()
{
    op.log("MQTT connection established");
    constructMqttObject();
    // outObj.set(undefined);
    outObj.set(mqttCablesObj);
    connectedPort.set(true);
};

const onFailure = function (res)
{
    op.log("MQTT Connection Failure, hit reconnect to try again...");
    op.log(res.errorMessage);
    mqttCablesObj.connected = false;
    outObj.set(null);
    connectedPort.set(false);
};

var onMessageArrived = function (message)
{
    constructMqttObject();
    mqttCablesObj.message = message;
    // inform others about change
    outObj.set(null);
    outObj.set(mqttCablesObj);
};

function constructMqttObject()
{
    mqttCablesObj = {};
    mqttCablesObj.objectType = "mqtt";
    // mqttCablesObj.client = client;
    mqttCablesObj.requestSubscribe = requestSubscribe;
    mqttCablesObj.requestUnsubscribe = requestUnsubscribe;
    mqttCablesObj.requestSend = requestSend;
    mqttCablesObj.connected = true;
}

function requestSend(message, topic)
{
    const messageObj = new Paho.MQTT.Message(message);
    messageObj.destinationName = topic;
    try
    {
        client.send(messageObj);
        op.uiAttr({ "error": null });
    }
    catch (e)
    {
        op.log("MQTTSend: Could not send message " + message + " to " + topic + ", maybe try to reconnect?!");
        op.uiAttr({ "error": "Could not send message, try to reconnect!" });
    }
}

function requestSubscribe(topic)
{
    // already subscribed
    if (topicMap.hasOwnProperty(topic))
    {
        topicMap[topic]++;
    }
    else
    {
        topicMap[topic] = 1;
        try
        {
            client.subscribe(topic);
        }
        catch (e)
        {
            op.log("Could not subscribe: " + e);
        }
    }
}

function requestUnsubscribe(topic)
{
    // check if topic is subscribed
    if (topicMap.hasOwnProperty(topic))
    {
        // only one op subscribed this topic, do unsubscribe
        if (topicMap[topic] <= 1)
        {
            try
            {
                client.unsubscribe(topic);
            }
            catch (e)
            {
                op.log("Could not unsubscribe: " + e);
            }
            delete topicMap[topic];
        }
        else
        { // another op subscribed this topic, do not unsubscribe
            topicMap[topic]--;
        }
    }
    else
    {
        // not subscribed, do nothing
    }
}

// called when the client loses its connection
function onConnectionLost(responseObject)
{
    op.log("MQTT Connection Lost... :/");
    op.log("Hit Reconnect-button to try again");
    if (responseObject.errorCode !== 0)
    {
        op.log("MQTT error message: " + responseObject.errorMessage);
    }
    mqttCablesObj.connected = false;
    outObj.set(null);
    // mqttCablesObj = null;
    connectedPort.set(false);
    connect(); // try again
}

/*
 * Called once after op finished loading, can be triggered by pressing reconnect-button
*/
function connect()
{
    op.log("MQTT Trying to connect to broker...");
    outObj.set(null);

    // connect the client with username / password
    if (mqttUsername.get() && mqttUsername.get().trim().length > 0)
    {
        op.log("with user credentials");
        client.connect({
            "onSuccess": onConnect,
            "onFailure": onFailure,
            "userName": mqttUsername.get(),
            "password": mqttPassword.get(),
            "useSSL": useSsl.get(),
            "timeout": TIMEOUT
        });
    }
    else
    { // connect anonymous
        op.log("anonymous");
        client.connect({
            "onSuccess": onConnect,
            "onFailure": onFailure,
            "useSSL": useSsl.get(),
            "timeout": TIMEOUT
        });
    }
}
