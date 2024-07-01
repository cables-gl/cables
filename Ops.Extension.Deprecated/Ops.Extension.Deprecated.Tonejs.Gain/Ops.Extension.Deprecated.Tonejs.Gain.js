CABLES.WEBAUDIO.createAudioContext(op);

// vars
let gainNode = new Tone.Gain();

// default values
let DEFAULT_GAIN_GAIN = 1;

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", gainNode);
let gainPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Gain", gainNode.gain, { "display": "range", "min": 0, "max": 1 }, DEFAULT_GAIN_GAIN);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", gainNode);
