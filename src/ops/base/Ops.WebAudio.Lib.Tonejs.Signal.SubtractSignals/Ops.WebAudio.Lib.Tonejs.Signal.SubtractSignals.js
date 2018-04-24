op.name="SubtractSignals";

CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.Subtract();

// input ports
var audioInPort1 = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 1", node, 0);
var audioInPort2 = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 2", node, 1);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);









