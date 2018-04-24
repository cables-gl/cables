op.name="StereoXFeedbackEffect";

CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.StereoXFeedbackEffect();

// default values
var FEEDBACK_MIN = 0.0; // ?
var FEEDBACK_MAX = 1.0; // ?
var WET_MIN = 0.0;
var WET_MAX = 1.0;

op.log('node.get("windowSize")', node.get("windowSize").windowSize);

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var feedbackPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Feedback", node.feedback, {"display": "range", "min": FEEDBACK_MIN, "max": FEEDBACK_MAX}, node.get("feedback").feedback);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, node.get("wet").wet);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};