CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.FeedbackDelay();

// default values
let DELAY_TIME_DEFAULT = 0.25;
let DELAY_TIME_MIN = 0.0;
let DELAY_TIME_MAX = 1.0;
let FEEDBACK_DEFAULT = 0.1; // ?
let FEEDBACK_MIN = 0.0; // ?
let FEEDBACK_MAX = 1.0; // ?
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let delayTimePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Delay Time", node.delayTime, { "display": "range", "min": DELAY_TIME_MIN, "max": DELAY_TIME_MAX }, DELAY_TIME_DEFAULT);
let feedbackPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Feedback", node.feedback, { "display": "range", "min": FEEDBACK_MIN, "max": FEEDBACK_MAX }, FEEDBACK_DEFAULT);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, WET_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
