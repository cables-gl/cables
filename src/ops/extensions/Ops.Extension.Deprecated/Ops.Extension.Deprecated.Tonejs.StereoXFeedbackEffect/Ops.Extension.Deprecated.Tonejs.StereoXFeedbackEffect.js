CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.StereoXFeedbackEffect();

// default values
let FEEDBACK_MIN = 0.0; // ?
let FEEDBACK_MAX = 1.0; // ?
let WET_MIN = 0.0;
let WET_MAX = 1.0;

op.log("node.get(\"windowSize\")", node.get("windowSize").windowSize);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let feedbackPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Feedback", node.feedback, { "display": "range", "min": FEEDBACK_MIN, "max": FEEDBACK_MAX }, node.get("feedback").feedback);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, node.get("wet").wet);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
