op.name="FeedbackDelay";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.FeedbackDelay();

// default values
var DELAY_TIME_DEFAULT = 0.25;
var DELAY_TIME_MIN = 0.0;
var DELAY_TIME_MAX = 1.0;
var FEEDBACK_DEFAULT = 0.1; // ?
var FEEDBACK_MIN = 0.0; // ?
var FEEDBACK_MAX = 1.0; // ?
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var delayTimePort = CABLES.WebAudio.createAudioParamInPort(op, "Delay Time", node.delayTime, {"display": "range", "min": DELAY_TIME_MIN, "max": DELAY_TIME_MAX}, DELAY_TIME_DEFAULT);
var feedbackPort = CABLES.WebAudio.createAudioParamInPort(op, "Feedback", node.feedback, {"display": "range", "min": FEEDBACK_MIN, "max": FEEDBACK_MAX}, FEEDBACK_DEFAULT);
var wetPort = CABLES.WebAudio.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};