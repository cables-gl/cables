CABLES.WEBAUDIO.createAudioContext(op);

// default
let THRESHOLD_DEFAULT = -28;
let THRESHOLD_MIN = -100;
let THRESHOLD_MAX = 0;

// vars
let node = new Tone.Limiter(THRESHOLD_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let thresholdPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Threshold", node.threshold, { "display": "range", "min": THRESHOLD_MIN, "max": THRESHOLD_MAX }, THRESHOLD_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
