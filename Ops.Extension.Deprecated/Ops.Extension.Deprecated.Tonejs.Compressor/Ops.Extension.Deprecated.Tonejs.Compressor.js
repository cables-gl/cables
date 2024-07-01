CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var RATIO_DEFAULT = 12;
let THRESHOLD_DEFAULT = -24;
let THRESHOLD_MIN = -90; // ?
let THRESHOLD_MAX = 0;
let ATTACK_DEFAULT = 0.003;
let ATTACK_MIN = 0; // ?
let ATTACK_MAX = 1;
let RELEASE_DEFAULT = 0.25;
let RELEASE_MIN = 0.00001; // ?
let RELEASE_MAX = 1;
let KNEE_DEFAULT = 30;
let KNEE_MIN = 0; // ?
let KNEE_MAX = 72; // ?
var RATIO_DEFAULT = 12;
let RATIO_MIN = 1;
let RATIO_MAX = 20;

// vars
let node = new Tone.Compressor(THRESHOLD_DEFAULT, RATIO_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let thresholdPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Threshold", node.threshold, { "display": "range", "min": THRESHOLD_MIN, "max": THRESHOLD_MAX }, THRESHOLD_DEFAULT);
let attackPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Attack", node.attack, { "display": "range", "min": ATTACK_MIN, "max": ATTACK_MAX }, ATTACK_DEFAULT);
let releasePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Release", node.release, { "display": "range", "min": RELEASE_MIN, "max": RELEASE_MAX }, RELEASE_DEFAULT);
let kneePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Knee", node.knee, { "display": "range", "min": KNEE_MIN, "max": KNEE_MAX }, KNEE_DEFAULT);
let ratioPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Ratio", node.ratio, { "display": "range", "min": RATIO_MIN, "max": RATIO_MAX }, RATIO_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
