op.name="Equalizer3";

CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var DECIBELS_MIN = -100;
var DECIBELS_MAX = 0;
var FREQUENCY_MIN = 1;
var FREQUENCY_MAX = 20000;

var LOW_DEFAULT = 0;
var MID_DEFAULT = 0;
var HIGH_DEFAULT = 0;
var LOW_FREQUENCY_DEFAULT = 400;
var HIGH_FREQUENCY_DEFAULT = 2500;
var Q_DEFAULT = 1; // ?
var Q_MIN = 1; // ?
var Q_MAX = 45; // ?

// vars
var node = new Tone.EQ3();

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var lowPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Low", node.low, {"display": "range", "min": DECIBELS_MIN, "max": DECIBELS_MAX}, LOW_DEFAULT);
var midPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Mid", node.mid, {"display": "range", "min": DECIBELS_MIN, "max": DECIBELS_MAX}, MID_DEFAULT);
var highPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "High", node.high, {"display": "range", "min": DECIBELS_MIN, "max": DECIBELS_MAX}, HIGH_DEFAULT);
var qPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Q", node.Q, {"display": "range", "min": Q_MIN, "max": Q_MAX}, Q_DEFAULT);
var lowFrequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Low Frequency", node.lowFrequency, {"display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX}, LOW_FREQUENCY_DEFAULT);
var highFrequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "High Frequency", node.highFrequency, {"display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX}, HIGH_FREQUENCY_DEFAULT);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);