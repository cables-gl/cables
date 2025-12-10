CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let VALUE_DEFAULT = 1;

// vars
let node = new Tone.Multiply(VALUE_DEFAULT);

// input ports
let signalPort = CABLES.WEBAUDIO.createAudioInPort(op, "Signal", node);
let valuePort = op.inValue("Value", VALUE_DEFAULT);

// listeners
valuePort.onChange = function ()
{
    try
    {
        node.set("value", valuePort.get());
    }
    catch (e) { op.log(e); }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
