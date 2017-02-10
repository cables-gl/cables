op.name="FeedbackCombFilter";

CABLES.WebAudio.createAudioContext(op);

// defaults
var NORMAL_RANGE_MIN = 0;
var NORMAL_RANGE_MAX = 1;

var DELAY_TIME_DEFAULT = 0.1;
var RESONANCE_DEFAULT = 0.5;

// vars
var node = new Tone.FeedbackCombFilter(DELAY_TIME_DEFAULT, RESONANCE_DEFAULT);

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var delayTimePort = CABLES.WebAudio.createAudioParamInPort(op, "Delay Time", node.delayTime, {"type": "string"}, DELAY_TIME_DEFAULT);
var resonancePort = CABLES.WebAudio.createAudioParamInPort(op, "Resonance", node.resonance, {"display": "range", "min": NORMAL_RANGE_MIN, "max": NORMAL_RANGE_MAX}, RESONANCE_DEFAULT);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);