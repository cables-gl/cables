CABLES.WEBAUDIO.createAudioContext(op);

// constants
let VALUE_DEFAULT = 1;

// vars
let node = new Tone.Signal();

// input ports
let valuePort = op.inValue("Value", VALUE_DEFAULT);

// change listeners
valuePort.onChange = function ()
{
    node.set("value", valuePort.get());
};

// input ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
