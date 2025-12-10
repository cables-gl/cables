CABLES.WEBAUDIO.createAudioContext(op);

// input ports
let startPort = op.addInPort(new CABLES.Port(this, "Start", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let timePort = op.inValueString("Time");
let offsetPort = op.inValueString("Offset");

// input port defaults
let TIME_DEFAULT = "+0";
let OFFSET_DEFAULT = "0";

// set default ports
timePort.set(TIME_DEFAULT);
offsetPort.set(OFFSET_DEFAULT);

// change listeners
startPort.onTriggered = function ()
{
    let time = timePort.get();
    let offset = timePort.get();
    if (time)
    {
        if (offset)
        {
            Tone.Transport.start(time, offset);
        }
        else
        {
            Tone.Transport.start(time);
        }
    }
    else
    {
        Tone.Transport.start();
    }
    op.log("Transport started with time: ", time);
};
