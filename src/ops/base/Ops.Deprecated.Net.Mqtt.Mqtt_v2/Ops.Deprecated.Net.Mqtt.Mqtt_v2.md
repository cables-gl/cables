[MQTT](http://mqtt.org/) (Message Queue Telemetry Transport)  is a lightweight messaging protocol which is widely used, e.g. by Facebook Messenger, for M2M (Machine to machine) communication. It used a publish-subscribe pattern to send messages from one device to another. Messages are send to so called channels (e.g. `/orientation/x/1.234`). Another device could then listen for this channel and get updates when data changes.  

For the communication to work an MQTT-broker (server) is needed, a very good service is [shiftr.io](https://shiftr.io) where users can create a free account which also features personal dashboards to show which data is sent around in realtime.  

The MQTT-ops currently allow to publish and subscribe data, QoS and topic-wildcards are not supported yet.

**Please note: ** User credentials can have read and write access to a data set or real-only. If you try to write out data using read-only user-credentials things will break!