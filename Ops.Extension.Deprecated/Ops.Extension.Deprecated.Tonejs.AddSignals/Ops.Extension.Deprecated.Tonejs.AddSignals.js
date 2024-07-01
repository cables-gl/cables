CABLES.WEBAUDIO.createAudioContext(op);

// vars
let addNode = new Tone.Add();

// input ports
let audioInPort1 = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 1", addNode, 0);
let audioInPort2 = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 2", addNode, 1);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", addNode);
