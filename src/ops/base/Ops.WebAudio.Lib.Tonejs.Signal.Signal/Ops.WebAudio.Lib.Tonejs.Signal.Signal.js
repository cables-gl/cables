op.name="Signal";

CABLES.WebAudio.createAudioContext(op);

// constants
var VALUE_DEFAULT = 1;

// vars
var node = new Tone.Signal();

// input ports
var valuePort = op.inValue("Value", VALUE_DEFAULT);

// change listeners
valuePort.onChange = function() {
    node.set("value", valuePort.get());
};

// input ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);
