op.name="StereoWidener";

CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.StereoWidener();

// default values
var WIDTH_DEFAULT = 0.5;
var WIDTH_MIN = 0.0;
var WIDTH_MAX = 1.0;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

op.log('node.get("windowSize")', node.get("windowSize").windowSize);

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var widthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Width", node.width, {"display": "range", "min": WIDTH_MIN, "max": WIDTH_MAX}, node.get("width").width);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, node.get("wet").wet);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};