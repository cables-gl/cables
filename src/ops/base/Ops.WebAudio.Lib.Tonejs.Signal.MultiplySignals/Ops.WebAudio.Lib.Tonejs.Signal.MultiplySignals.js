op.name="MultiplySignals";

CABLES.WebAudio.createAudioContext(op);

// vars
var addNode = new Tone.Multiply();

// input ports
var audioInPort1 = CABLES.WebAudio.createAudioInPort(op, "Signal 1", addNode, 0);
var audioInPort2 = CABLES.WebAudio.createAudioInPort(op, "Signal 2", addNode, 1);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", addNode);








