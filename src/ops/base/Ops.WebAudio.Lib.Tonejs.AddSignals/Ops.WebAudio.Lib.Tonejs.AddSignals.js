op.name="AddSignals";

CABLES.WebAudio.createAudioContext(op);

// vars
var addNode = new Tone.Add();

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Signal 1", addNode, 0);
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Signal 2", addNode, 1);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", addNode);








