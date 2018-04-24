op.name="AutoPanner";

CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.AutoPanner().start(); // TODO: create start / stop nodes!?

// default values
var DEPTH_DEFAULT = 1;
var DEPTH_MIN = 0;
var DEPTH_MAX = 1;
var FREQUENCY_DEFAULT = 1;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var depthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Depth", node.depth, {"display": "range", "min": DEPTH_MIN, "max": DEPTH_MAX}, DEPTH_DEFAULT);
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

