# MqttReceive

*Ops.Net.Mqtt.MqttReceive*

Subscribes to a MQTT channel and receives data from it. Every time there is a new message, the output port `Message` will change. Needs to be connected to the MQTT-op.

## Input

### MQTT Object [Object]

Internally used in cables for inter-op-communication

### Channel [String]

The channel you want to subscribe and receive data from, e.g. `/data/sensor1/x`

### Message Type

Either `String`, `Number` or `Boolean`. if the data-type you receive is a number (`123` or `123.45`) set to number. If you receive multiple numbers in one `123,124,125` you need to use `String` (default).

## Output

### MQTT Object [Object]

Internally used in cables for inter-op-communication

### Message

The last MQTT message which has been received, casted according to the `Message Type` set (see above).

### Topic

Currently the same as the input port `Channel`. In MQTT you could also subscribe via wildcards, e.g. `/sensor1/#`, this will subscribe to `/sensor1/x` as well as `/sensor1/y`. Currently not supported…