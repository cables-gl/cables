CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.Subtract();

// input ports
let audioInPort1 = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 1", node, 0);
let audioInPort2 = CABLES.WEBAUDIO.createAudioInPort(op, "Signal 2", node, 1);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
