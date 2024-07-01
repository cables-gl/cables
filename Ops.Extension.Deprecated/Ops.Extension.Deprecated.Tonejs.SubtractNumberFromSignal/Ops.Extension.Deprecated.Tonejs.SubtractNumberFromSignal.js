CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let VALUE_DEFAULT = 0.5;

// vars
let node = new Tone.Subtract(0);

// input ports
let signalPort = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 1", node);
let valuePort = op.inValue("Value", VALUE_DEFAULT);

// listeners
valuePort.onChange = function ()
{
    node.set("value", valuePort.get());
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
