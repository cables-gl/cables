op.name="PitchShift";

CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.PitchShift();

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
var PITCH_DEFAULT = 0.0;
var WINDOW_SIZE_DEFAULT = 0.1;
var WINDOW_SIZE_MIN = 0.01;
var WINDOW_SIZE_MAX = 0.2;

op.log('node.get("windowSize")', node.get("windowSize").windowSize);

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var delayTimePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Delay Time", node.delayTime, {"display": "range", "min": DELAY_TIME_MIN, "max": DELAY_TIME_MAX}, node.get("delayTime").delayTime);
var pitchPort = op.inValue("Pitch", PITCH_DEFAULT);
var windowSizePort = op.addInPort( new CABLES.Port( op, "Window Size", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': WINDOW_SIZE_MIN, 'max': WINDOW_SIZE_MAX }, node.get("windowSize").windowSize ));
var feedbackPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Feedback", node.feedback, {"display": "range", "min": FEEDBACK_MIN, "max": FEEDBACK_MAX}, node.get("feedback").feedback);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, node.get("wet").wet);

// change listeners
pitchPort.onChange = function() {
    var pitch = pitchPort.get();
    node.set("pitch", pitch);
};
windowSizePort.onChange = function() {
    var windowSize = windowSizePort.get();
    node.set("windowSize", windowSize);
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};