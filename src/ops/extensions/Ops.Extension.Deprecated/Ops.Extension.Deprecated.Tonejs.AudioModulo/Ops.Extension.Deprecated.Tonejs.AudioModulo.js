CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let VALUE_DEFAULT = 0.2;

// vars
let node = new Tone.Modulo(VALUE_DEFAULT);

// input ports
let signalPort = CABLES.WEBAUDIO.createAudioInPort(op, "Signal", node);
let valuePort = op.inValue("Value", VALUE_DEFAULT);

// listeners
valuePort.onChange = function ()
{
    let val = valuePort.get();
    if (val)
    {
        node.set("value", valuePort.get());
    }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
