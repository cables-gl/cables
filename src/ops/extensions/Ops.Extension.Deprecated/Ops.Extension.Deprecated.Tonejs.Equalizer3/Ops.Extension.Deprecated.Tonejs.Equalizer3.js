CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let DECIBELS_MIN = -100;
let DECIBELS_MAX = 0;
let FREQUENCY_MIN = 1;
let FREQUENCY_MAX = 20000;

let LOW_DEFAULT = 0;
let MID_DEFAULT = 0;
let HIGH_DEFAULT = 0;
let LOW_FREQUENCY_DEFAULT = 400;
let HIGH_FREQUENCY_DEFAULT = 2500;
let Q_DEFAULT = 1; // ?
let Q_MIN = 1; // ?
let Q_MAX = 45; // ?

// vars
let node = new Tone.EQ3();

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let lowPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Low", node.low, { "display": "range", "min": DECIBELS_MIN, "max": DECIBELS_MAX }, LOW_DEFAULT);
let midPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Mid", node.mid, { "display": "range", "min": DECIBELS_MIN, "max": DECIBELS_MAX }, MID_DEFAULT);
let highPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "High", node.high, { "display": "range", "min": DECIBELS_MIN, "max": DECIBELS_MAX }, HIGH_DEFAULT);
let qPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Q", node.Q, { "display": "range", "min": Q_MIN, "max": Q_MAX }, Q_DEFAULT);
let lowFrequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Low Frequency", node.lowFrequency, { "display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX }, LOW_FREQUENCY_DEFAULT);
let highFrequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "High Frequency", node.highFrequency, { "display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX }, HIGH_FREQUENCY_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
