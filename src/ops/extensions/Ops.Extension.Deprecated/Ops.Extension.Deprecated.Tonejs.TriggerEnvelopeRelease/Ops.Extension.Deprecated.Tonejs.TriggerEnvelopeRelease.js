CABLES.WEBAUDIO.createAudioContext(op);

// default values
let TIME_DEFAULT = "+0";

// in ports
let audioIn = op.inObject("Audio In");
let timePort = op.inValueString("Time", "+0");
let triggerReleasePort = op.addInPort(new CABLES.Port(this, "Trigger Release", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

// listeners
triggerReleasePort.onTriggered = function ()
{
    let node = audioIn.get();
    if (node && node.triggerRelease)
    {
        let time = timePort.get() || TIME_DEFAULT;
        node.triggerRelease(time);
    }
};
