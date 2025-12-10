CABLES.WEBAUDIO.createAudioContext(op);

// default values
let TIME_DEFAULT = "+0";
let VELOCITY_DEFAULT = 1;

// in ports
let audioIn = op.inObject("Audio In");
let timePort = op.inValueString("Time", TIME_DEFAULT);
timePort.set(TIME_DEFAULT);
let velocityPort = op.inValueSlider("Velocity", VELOCITY_DEFAULT);
let triggerAttackPort = op.addInPort(new CABLES.Port(this, "Trigger Attack", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));

// listeners
triggerAttackPort.onTriggered = function ()
{
    op.log("triggerAttackPort");
    op.log("triggerAttackPort");
    let node = audioIn.get();
    if (node && node.triggerAttack)
    {
        let time = timePort.get() || TIME_DEFAULT;
        let velocity = velocityPort.get();
        node.triggerAttack(time, velocity);
    }
};
