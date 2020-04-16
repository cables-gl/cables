SocketCluster connects to the websocket at the given hostname. Then you define a channel that all the messages will be sent to. SocketCluster outputs a socket that has to be used in senders and receivers. 

There can be multiple sockets in one patch.

Every message has a "topic" and a datatype, only the relevant datatypes will be received by the right receiving ops listening to that "topic".

In default mode only one "client" is allowed to send, this is controlled by the "allowSend" input. On changing this, all the other clients will be notified and change to "listening" state.

By enabling "allow multiple senders" all the clients are allowed to send (depending on their setting of "allowSend"). This can lead to endless loops in for example a setup where a TriggerChangeValue triggers a send, then the message is received and changes the value...be careful!

Clients do not handle their own messages, every statechange has to be done directly in the patch as well. This is to avoid more possibilities for endless loops.

For more information visit: https://socketcluster.io/
