op.name="SubtractSignals";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.Subtract();

// input ports
var audioInPort1 = CABLES.WebAudio.createAudioInPort(op, "Signal 1", node, 0);
var audioInPort2 = CABLES.WebAudio.createAudioInPort(op, "Signal 2", node, 1);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);









