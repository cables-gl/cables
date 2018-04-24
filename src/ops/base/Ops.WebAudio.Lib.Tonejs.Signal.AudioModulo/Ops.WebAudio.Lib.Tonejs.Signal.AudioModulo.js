op.name="AudioModulo";

CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var VALUE_DEFAULT = 0.2;

// vars
var node = new Tone.Modulo(VALUE_DEFAULT);

// input ports
var signalPort = CABLES.WEBAUDIO.createAudioInPort(op, "Signal", node);
var valuePort = op.inValue("Value", VALUE_DEFAULT);

// listeners
valuePort.onChange = function() {
    var val = valuePort.get();
    if(val) {
        node.set("value", valuePort.get());    
    }
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);








