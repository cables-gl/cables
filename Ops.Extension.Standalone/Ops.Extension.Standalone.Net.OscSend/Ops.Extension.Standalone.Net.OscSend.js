const osc=op.require("osc");

const
    inConn = op.inObject("Connection"),
    inIp = op.inString("Net Address", "192.168.1.106"),
    inPort = op.inInt("Port", 9000),
    inAddress = op.inString("OSC Address", "/1/Volume"),
    myNumber = op.inFloat("Number"),
    exec = op.inTriggerButton("Send");

if(osc)
{
    exec.onTriggered = send;

    function send()
    {
        const udpPort = inConn.get();
        if (!udpPort) return;

        udpPort.send({
            "address": inAddress.get(),
            "args": [
                {
                    "type": "f",
                    "value": myNumber.get()
                }
            ]
        }, inIp.get(), inPort.get());
    }

}
