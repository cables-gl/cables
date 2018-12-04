
CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var VALUE_DEFAULT = 1;

// vars
var node = new Tone.Multiply(VALUE_DEFAULT);

// input ports
var signalPort = CABLES.WEBAUDIO.createAudioInPort(op, "Signal", node);
var valuePort = op.inValue("Value", VALUE_DEFAULT);

// listeners
valuePort.onChange = function() {
    try {
        node.set("value", valuePort.get());
    } catch(e) { op.log(e); }
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);








