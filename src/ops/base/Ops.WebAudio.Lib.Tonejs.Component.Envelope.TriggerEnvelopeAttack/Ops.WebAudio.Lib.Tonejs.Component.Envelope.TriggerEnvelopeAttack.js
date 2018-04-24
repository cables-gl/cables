op.name="TriggerEnvelopeAttack";

CABLES.WEBAUDIO.createAudioContext(op);

// default values
var TIME_DEFAULT = "+0";
var VELOCITY_DEFAULT = 1;

// in ports
var audioIn = op.inObject("Audio In");
var timePort = op.inValueString("Time", TIME_DEFAULT);
timePort.set(TIME_DEFAULT);
var velocityPort = op.inValueSlider("Velocity", VELOCITY_DEFAULT);
var triggerAttackPort = op.addInPort( new Port( this, "Trigger Attack", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));

// listeners
triggerAttackPort.onTriggered = function() {
    op.log("triggerAttackPort");
    op.log("triggerAttackPort");
    var node = audioIn.get();
    if(node && node.triggerAttack) {
        var time = timePort.get() || TIME_DEFAULT;
        var velocity = velocityPort.get();
        node.triggerAttack(time, velocity);
    }
};
