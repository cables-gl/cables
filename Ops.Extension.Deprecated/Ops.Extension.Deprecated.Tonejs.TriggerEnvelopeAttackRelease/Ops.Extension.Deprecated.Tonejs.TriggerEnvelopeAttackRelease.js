CABLES.WEBAUDIO.createAudioContext(op);

// default values
let DURATION_DEFAULT = "4n";
let TIME_DEFAULT = "+0";
let VELOCITY_DEFAULT = 1;

// in ports
let audioIn = op.inObject("Audio In");
let durationPort = op.inValueString("Duration", DURATION_DEFAULT);
durationPort.set(DURATION_DEFAULT);
let timePort = op.inValueString("Time", TIME_DEFAULT);
timePort.set(TIME_DEFAULT);
let velocityPort = op.inValueSlider("Velocity", VELOCITY_DEFAULT);
let triggerAttackReleasePort = op.addInPort(new CABLES.Port(this, "Trigger Attack Release", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

// listeners
triggerAttackReleasePort.onTriggered = function ()
{
    let node = audioIn.get();
    if (node && node.triggerAttackRelease)
    {
        let duration = durationPort.get() || DURATION_DEFAULT;
        let time = timePort.get() || TIME_DEFAULT;
        let velocity = velocityPort.get();
        node.triggerAttackRelease(duration, time, velocity);
    }
};
