op.name="MultiplySignals";
CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.Multiply();

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Signal 1", node, 0);
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Signal 2", node, 1);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);








