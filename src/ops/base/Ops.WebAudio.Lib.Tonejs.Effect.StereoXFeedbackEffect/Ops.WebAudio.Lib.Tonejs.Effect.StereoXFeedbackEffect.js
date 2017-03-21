op.name="StereoXFeedbackEffect";
op.name="PitchShift";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.PitchShift();

// default values
var FEEDBACK_DEFAULT = 0.1 // ?
var FEEDBACK_MIN = 0.0 // ?
var FEEDBACK_MAX = 1.0 // ?
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

op.log('node.get("windowSize")', node.get("windowSize").windowSize);

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var feedbackPort = CABLES.WebAudio.createAudioParamInPort(op, "Feedback", node.feedback, {"display": "range", "min": FEEDBACK_MIN, "max": FEEDBACK_MAX}, node.get("feedback").feedback);
var wetPort = CABLES.WebAudio.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, node.get("wet").wet);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};