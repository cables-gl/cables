CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.Tremolo();

/*
frequency:10
type:"sine"
depth:0.5
spread:180
*/

// default values
let WIDTH_DEFAULT = 0.5;
let WIDTH_MIN = 0.0;
let WIDTH_MAX = 1.0;
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let widthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Width", node.width, { "display": "range", "min": WIDTH_MIN, "max": WIDTH_MAX }, node.get("width").width);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, node.get("wet").wet);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
