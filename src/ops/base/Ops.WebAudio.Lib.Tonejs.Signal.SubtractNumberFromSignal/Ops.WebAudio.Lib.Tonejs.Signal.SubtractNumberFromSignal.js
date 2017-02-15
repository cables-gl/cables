op.name="SubtractNumberFromSignal";

CABLES.WebAudio.createAudioContext(op);

// defaults
var VALUE_DEFAULT = 0.5;

// vars
var node = new Tone.Subtract(0);

// input ports
var signalPort = CABLES.WebAudio.createAudioInPort(op, "Signal 1", node);
var valuePort = op.inValue("Value", VALUE_DEFAULT);

// listeners
valuePort.onChange = function() {
    node.set("value", valuePort.get());
};

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);









