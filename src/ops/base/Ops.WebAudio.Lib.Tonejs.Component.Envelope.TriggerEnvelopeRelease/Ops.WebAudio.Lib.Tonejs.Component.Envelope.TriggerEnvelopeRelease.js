op.name="TriggerEnvelopeRelease";

CABLES.WEBAUDIO.createAudioContext(op);

// default values
var TIME_DEFAULT = "+0";

// in ports
var audioIn = op.inObject("Audio In");
var timePort = op.inValueString("Time", "+0");
var triggerReleasePort = op.addInPort( new CABLES.Port( this, "Trigger Release",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));

// listeners
triggerReleasePort.onTriggered = function() {
    var node = audioIn.get();
    if(node && node.triggerRelease) {
        var time = timePort.get() || TIME_DEFAULT;
        node.triggerRelease(time);
    }
};
