CABLES.WebAudio.createAudioContext(op);

// defaults
var SMOOTHING_DEFAULT = 0.8;
var SMOOTHING_MIN = 0.0; // ?
var SMOOTHING_MAX = 1.0; // ?

// vars
var node = new Tone.Meter (SMOOTHING_DEFAULT);

// inputs
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var updateValuePort = op.inFunction("Update Value");
var smoothingPort = op.inValueSlider("Smoothing");
smoothingPort.set(SMOOTHING_DEFAULT);

// change listeners
updateValuePort.onTriggered = function() {
    valuePort.set(node.getValue());
};
smoothingPort.onChange = function() {
    var smoothing = smoothingPort.get();
    if(smoothing && smoothing >= SMOOTHING_MIN && smoothing <= SMOOTHING_MAX) {
        node.set("smoothing", smoothing);
    }    
};

// outputs
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);
var valuePort = op.outValue("Value");
valuePort.set(0);