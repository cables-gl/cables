CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let VALUE_DEFAULT = 0.5;

// vars
let addNode = new Tone.Add(0);

// input ports
let signalPort = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 1", addNode);
let valuePort = op.inValue("Value", VALUE_DEFAULT);

// listeners
valuePort.onChange = function ()
{
    op.log("signal before", addNode.value);
    addNode.set("value", valuePort.get());
    op.log("signal after", addNode.value);
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", addNode);
