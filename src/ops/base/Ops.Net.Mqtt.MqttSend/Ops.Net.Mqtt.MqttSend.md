# MqttSend

*Ops.Net.Mqtt.MqttSend*  

Sends a MQTT-message. Needs to be connected to the Mqtt-op, where you have to input the server, username and password.

## Input

### MQTT Object [Object]

Internally used in cables for inter-op-communication

## Message [String]

The message you want to send, can be something like`123`, `123.45`, `123,124,125` or `Hello World`

### Channel [String]

The channel you want to send the data to, should begin with a forward slash, e.g. `/test` or `/sensordata/orientation/x`

## Output

### MQTT Object [Object]

Internally used in cables for inter-op-communication