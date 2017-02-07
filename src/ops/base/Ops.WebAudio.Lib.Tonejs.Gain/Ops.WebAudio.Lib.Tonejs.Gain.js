op.name="Gain";

CABLES.WebAudio.createAudioContext(op);

// vars
var gainNode = new Tone.Gain();
op.log("gainNode.gain: ", gainNode.gain);

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", gainNode);
var gainPort = CABLES.WebAudio.createAudioInPort(op, "Gain", gainNode.gain);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", gainNode);

// default values
var DEFAULT_GAIN_GAIN = 1;

// set input ports
//gainPort.set(DEFAULT_GAIN_GAIN);








