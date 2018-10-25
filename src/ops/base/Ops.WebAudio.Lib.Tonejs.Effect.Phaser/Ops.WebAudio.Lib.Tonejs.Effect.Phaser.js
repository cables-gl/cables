op.name="Phaser";

CABLES.WEBAUDIO.createAudioContext(op);

// TODO:
// - stages seems not to be supported - tone.js bug?

// constants
var Q_DEFAULT = 1; // ?
var Q_MIN = 1; // ?
var Q_MAX = 20; // ?
var FREQUENCY_DEFAULT = 0.5;
var FREQUENCY_MIN = 0;
var FREQUENCY_MAX = 200;
var OCTAVES_DEFAULT = 3;
var OCTAVES_MIN = 1;
var OCTAVES_MAX = 6;
var BASE_FREQUENCY_DEFAULT = 350; // TODO: check base-frequency range - can be too loud!
var BASE_FREQUENCY_MIN = 1;
var BASE_FREQUENCY_MAX = 10000;
/*
var STAGES_DEFAULT = 10;
var STAGES_MIN = 1; // ?
var STAGES_MAX = 20; // ?
*/
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// vars
var node = new Tone.Phaser();

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var qPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Q", node.Q, {"display": "range", "min": Q_MIN, "max": Q_MAX}, Q_DEFAULT);
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, {"display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX}, FREQUENCY_DEFAULT);
var octavesPort = op.addInPort( new Port( op, "Octaves", CABLES.OP_PORT_TYPE_, { 'display': 'range', 'min': OCTAVES_MIN, 'max': OCTAVES_MAX } ));
octavesPort.set(OCTAVES_DEFAULT);
var baseFrequencyPort = op.inValue("Base Frequency");
baseFrequencyPort.set(BASE_FREQUENCY_DEFAULT);
/*
var stagesPort = op.addInPort( new Port( op, "Stages", CABLES.OP_PORT_TYPE_, { 'display': 'range', 'min': STAGES_MIN, 'max': STAGES_MAX } ));
stagesPort.set(STAGES_DEFAULT);
*/
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
octavesPort.onChange = function() {
    var octaves = octavesPort.get();
    if(isInRange(octaves, OCTAVES_MIN, OCTAVES_MAX)) {
        node.set("octaves", octaves);
    }
};
/*
stagesPort.onChange = function() {
    var stages = stagesPort.get();
    if(isInRange(stages, STAGES_MIN, STAGES_MAX)) {
        node.set("stages", stages);
    }
};
*/
baseFrequencyPort.onChange = function() {
    var baseFrequency = baseFrequencyPort.get();
    if(isInRange(baseFrequency, BASE_FREQUENCY_MIN, BASE_FREQUENCY_MAX)) {
        node.set("baseFrequency", baseFrequency);
    }
};

// functions
function isInRange(val, min, max) {
    return typeof val !== 'undefined' && val >= min && val <= max;
}

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

op.onDelete = function() {
    node.dispose();
};