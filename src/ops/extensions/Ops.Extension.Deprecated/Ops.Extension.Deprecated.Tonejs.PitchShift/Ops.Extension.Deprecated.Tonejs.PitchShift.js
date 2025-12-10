CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.PitchShift();

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
let PITCH_DEFAULT = 0.0;
let WINDOW_SIZE_DEFAULT = 0.1;
let WINDOW_SIZE_MIN = 0.01;
let WINDOW_SIZE_MAX = 0.2;

op.log("node.get(\"windowSize\")", node.get("windowSize").windowSize);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let delayTimePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Delay Time", node.delayTime, { "display": "range", "min": DELAY_TIME_MIN, "max": DELAY_TIME_MAX }, node.get("delayTime").delayTime);
let pitchPort = op.inValue("Pitch", PITCH_DEFAULT);
let windowSizePort = op.addInPort(new CABLES.Port(op, "Window Size", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": WINDOW_SIZE_MIN, "max": WINDOW_SIZE_MAX }, node.get("windowSize").windowSize));
let feedbackPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Feedback", node.feedback, { "display": "range", "min": FEEDBACK_MIN, "max": FEEDBACK_MAX }, node.get("feedback").feedback);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, node.get("wet").wet);

// change listeners
pitchPort.onChange = function ()
{
    let pitch = pitchPort.get();
    node.set("pitch", pitch);
};
windowSizePort.onChange = function ()
{
    let windowSize = windowSizePort.get();
    node.set("windowSize", windowSize);
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
