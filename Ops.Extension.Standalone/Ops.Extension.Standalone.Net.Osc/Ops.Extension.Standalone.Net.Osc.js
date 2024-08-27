
const
    inPort = op.inInt("Port",9000),
    next = op.outTrigger("Message Received"),
    msg=op.outObject("Message"),
    outConn=op.outObject("Connection"),
    inTest=op.inTriggerButton("Test"),
    outStatus=op.outString("Status");

const osc=op.require("osc");
let udpPort=null;
inPort.onChange=start;
start();

function start()
{
    if(udpPort)stop();
    outStatus.set("connecting");

    try
    {
        udpPort = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: 9000,
            metadata: true
        });

        udpPort.open();

        udpPort.on("error", function (e)
        {
            outStatus.set(e.message);
        });

        udpPort.on("message", function (m)
        {
            msg.setRef(m);
            next.trigger();
        });

        udpPort.on("ready", function () {
            outStatus.set("ready");
            outConn.set(udpPort);
        });

    }
    catch(e)
    {
        outStatus.set(e.message);
    }
}

function stop()
{
    if(udpPort)udpPort.close();
    udpPort=null;
    outConn.set(null);
}


inTest.onTriggered=()=>
{

};