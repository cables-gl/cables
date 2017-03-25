op.name="Gain";

CABLES.WebAudio.createAudioContext(op);

// vars
var gainNode = new Tone.Gain();

// default values
var DEFAULT_GAIN_GAIN = 1;

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", gainNode);
var gainPort = CABLES.WebAudio.createAudioParamInPort(op, "Gain", gainNode.gain, {'display': 'range', 'min': 0, 'max': 1}, DEFAULT_GAIN_GAIN);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", gainNode);









