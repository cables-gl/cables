
const
    inPort = op.inInt("Port",9000),
    next = op.outTrigger("Message Received"),
    msg=op.outObject("Message"),
    outConn=op.outObject("Connection"),
    outStatus=op.outString("Status");

const osc=op.require("osc");
let udpPort=null;
inPort.onChange=start;
op.onDelete=stop;
start();

function start()
{
    outStatus.set("");
    if(udpPort)stop();
    outStatus.set("connecting");

    try
    {
        udpPort = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: inPort.get(),
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
