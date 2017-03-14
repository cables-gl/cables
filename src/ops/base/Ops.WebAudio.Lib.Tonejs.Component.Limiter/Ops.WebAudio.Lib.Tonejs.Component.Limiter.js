op.name="Limiter";

CABLES.WebAudio.createAudioContext(op);

// default
var THRESHOLD_DEFAULT = -28;
var THRESHOLD_MIN = -100;
var THRESHOLD_MAX = 0;

// vars
var node = new Tone.Limiter(THRESHOLD_DEFAULT);

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var thresholdPort = CABLES.WebAudio.createAudioParamInPort(op, "Threshold", node.threshold, {"display": "range", "min": THRESHOLD_MIN, "max": THRESHOLD_MAX}, THRESHOLD_DEFAULT);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);