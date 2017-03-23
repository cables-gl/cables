op.name="Tremolo";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.Tremolo();

/*
frequency:10
type:"sine"
depth:0.5
spread:180
*/

// default values
var WIDTH_DEFAULT = 0.5;
var WIDTH_MIN = 0.0;
var WIDTH_MAX = 1.0;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var widthPort = CABLES.WebAudio.createAudioParamInPort(op, "Width", node.width, {"display": "range", "min": WIDTH_MIN, "max": WIDTH_MAX}, node.get("width").width);
var wetPort = CABLES.WebAudio.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, node.get("wet").wet);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};