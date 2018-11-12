op.name="Chorus";

CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.Chorus();
var OSCILLATOR_TYPES = [
    "sine", 
    "sine2", 
    "sine3", 
    "sine4", 
    "sine5", 
    "sine6", 
    "sine7", 
    "sine8", 
    "square", 
    "square2", 
    "square3", 
    "square4", 
    "square5", 
    "square6", 
    "square7", 
    "square8", 
    "triangle",
    "triangle2",
    "triangle3",
    "triangle4",
    "triangle5",
    "triangle6",
    "triangle7",
    "triangle8",
    "sawtooth",
    "sawtooth2",
    "sawtooth3",
    "sawtooth4",
    "sawtooth5",
    "sawtooth6",
    "sawtooth7",
    "sawtooth8"
];

// default values
var FREQUENCY_DEFAULT = 1.5;
var DELAY_TIME_DEFAULT = 3.5;
var DEPTH_DEFAULT = 0.7;
var DEPTH_MIN = 0.0;
var DEPTH_MAX = 1.0;
var DELAY_TIME_MIN = 2;
var DELAY_TIME_MAX = 20;
var DEPTH_DEFAULT = 0.7;
var FEEDBACK_DEFAULT = 0.1;
var FEEDBACK_MIN = 0.0;
var FEEDBACK_MAX = 1.0;
var OSCILLATOR_TYPE_DEFAULT = "sine";
var SPREAD_DEFAULT = 180;
var SPREAD_MIN = 0;
var SPREAD_MAX = 180;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var depthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Depth", node.depth, {"display": "range", "min": DEPTH_MIN, "max": DEPTH_MAX}, DEPTH_DEFAULT);
var delayTimePort = op.addInPort( new CABLES.Port( op, "Delay Time", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': DELAY_TIME_MIN, 'max': DELAY_TIME_MAX } ));
delayTimePort.set(DELAY_TIME_DEFAULT);
var oscillatorTypePort = op.addInPort( new CABLES.Port( op, "Oscillator Type", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: OSCILLATOR_TYPES } ) );
oscillatorTypePort.set(OSCILLATOR_TYPE_DEFAULT);
var spreadPort = op.addInPort( new CABLES.Port( op, "Spread", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': SPREAD_MIN, 'max': SPREAD_MAX } ));
spreadPort.set(SPREAD_DEFAULT);
var feedbackPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Feedback", node.feedback, {"display": "range", "min": FEEDBACK_MIN, "max": FEEDBACK_MAX}, FEEDBACK_DEFAULT);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
delayTimePort.onChange = function() {
    var delayTime = delayTimePort.get();
    if(delayTime) {
        if(delayTime >= DELAY_TIME_MIN ) { // not restrictive, maybe bigger values work well
            setNodeValue("delayTime", delayTime);       
        }
    }
};
oscillatorTypePort.onChange = function() {
    var oscillatorType = oscillatorTypePort.get();
    if(oscillatorType && OSCILLATOR_TYPES.indexOf(oscillatorType) > -1) {
        setNodeValue("type", oscillatorType);       
    }
};
spreadPort.onChange = function() {
    var spread = spreadPort.get();
    if(spread) {
        if(spread >= SPREAD_MIN && spread <= SPREAD_MAX ) { // not restrictive, maybe bigger values work well
            setNodeValue("spread", spread);       
        }
    }
};

// functions
function setNodeValue(key, val) {
    if(key && typeof val !== 'undefined') {
        node.set(key, val);
    }
}

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

