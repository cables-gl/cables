op.name="TriggerEnvelopeAttackRelease";

CABLES.WEBAUDIO.createAudioContext(op);

// default values
var DURATION_DEFAULT = "4n";
var TIME_DEFAULT = "+0";
var VELOCITY_DEFAULT = 1;

// in ports
var audioIn = op.inObject("Audio In");
var durationPort = op.inValueString("Duration", DURATION_DEFAULT);
durationPort.set(DURATION_DEFAULT);
var timePort = op.inValueString("Time", TIME_DEFAULT);
timePort.set(TIME_DEFAULT);
var velocityPort = op.inValueSlider("Velocity", VELOCITY_DEFAULT);
var triggerAttackReleasePort = op.addInPort( new CABLES.Port( this, "Trigger Attack Release",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));

// listeners
triggerAttackReleasePort.onTriggered = function() {
    var node = audioIn.get();
    if(node && node.triggerAttackRelease) {
        var duration = durationPort.get() || DURATION_DEFAULT;
        var time = timePort.get() || TIME_DEFAULT;
        var velocity = velocityPort.get();
        node.triggerAttackRelease(duration, time, velocity);
    }
};
