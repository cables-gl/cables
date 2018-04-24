op.name="MultiplySignals";

CABLES.WEBAUDIO.createAudioContext(op);

// vars
var addNode = new Tone.Multiply();

// input ports
var audioInPort1 = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 1", addNode, 0);
var audioInPort2 = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 2", addNode, 1);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", addNode);








