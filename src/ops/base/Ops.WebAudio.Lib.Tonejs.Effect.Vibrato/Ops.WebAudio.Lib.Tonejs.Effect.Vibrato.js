op.name="Vibrato";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
var MAX_DELAY_DEFAULT = 0.005;
var MAX_DELAY_MIN = 0.001;
var MAX_DELAY_MAX = 0.01;
var FREQUENCY_DEFAULT = 5;
var FREQUENCY_MIN = 0.01;
var FREQUENCY_MAX = 100;
var DEPTH_DEFAULT = 0.1;
var DEPTH_MIN = 0.0;
var DEPTH_MAX = 1.0;
var TYPES = [
    "sine",
    "square",
    "triangle",
    "sawtooth"
];
var TYPE_DEFAULT = "sine";
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// vars
var node = new Tone.Vibrato(FREQUENCY_DEFAULT, DEPTH_DEFAULT);

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, {"display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX}, node.get("frequency").frequency);
var depthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Depth", node.depth, {"display": "range", "min": DEPTH_MIN, "max": DEPTH_MAX}, node.get("depth").depth);
var typePort = op.addInPort( new Port( op, "Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES }, TYPE_DEFAULT ) );
//typePort.set(TYPE_DEFAULT);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, node.get("wet").wet);

// change listeneres
typePort.onChange = function() {
    var t = typePort.get();
    if(t && TYPES.indexOf(t) > -1) {
        node.set("type", t);
    }
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};