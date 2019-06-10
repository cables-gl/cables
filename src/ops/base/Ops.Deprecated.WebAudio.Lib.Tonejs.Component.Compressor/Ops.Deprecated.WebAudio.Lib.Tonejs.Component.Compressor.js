CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var RATIO_DEFAULT = 12;
var THRESHOLD_DEFAULT = -24;
var THRESHOLD_MIN = -90; // ?
var THRESHOLD_MAX = 0;
var ATTACK_DEFAULT = 0.003;
var ATTACK_MIN = 0; // ?
var ATTACK_MAX = 1;
var RELEASE_DEFAULT = 0.25;
var RELEASE_MIN = 0.00001; // ?
var RELEASE_MAX = 1;
var KNEE_DEFAULT = 30;
var KNEE_MIN = 0; // ?
var KNEE_MAX = 72; // ?
var RATIO_DEFAULT = 12;
var RATIO_MIN = 1;
var RATIO_MAX = 20;

// vars
var node = new Tone.Compressor(THRESHOLD_DEFAULT, RATIO_DEFAULT);

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var thresholdPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Threshold", node.threshold, {"display": "range", "min": THRESHOLD_MIN, "max": THRESHOLD_MAX}, THRESHOLD_DEFAULT);
var attackPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Attack", node.attack, {"display": "range", "min": ATTACK_MIN, "max": ATTACK_MAX}, ATTACK_DEFAULT);
var releasePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Release", node.release, {"display": "range", "min": RELEASE_MIN, "max": RELEASE_MAX}, RELEASE_DEFAULT);
var kneePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Knee", node.knee, {"display": "range", "min": KNEE_MIN, "max": KNEE_MAX}, KNEE_DEFAULT);
var ratioPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Ratio", node.ratio, {"display": "range", "min": RATIO_MIN, "max": RATIO_MAX}, RATIO_DEFAULT);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);