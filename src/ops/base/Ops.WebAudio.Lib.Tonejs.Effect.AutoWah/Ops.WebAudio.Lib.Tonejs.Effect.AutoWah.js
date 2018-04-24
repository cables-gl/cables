op.name="AutoWah";

CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var GAIN_DEFAULT = 2;
var GAIN_MIN = 0;
var GAIN_MAX = 2;  // TODO: check
var QUALITY_DEFAULT = 2;
var QUALITY_MIN = 1; // TODO: check
var QUALITY_MAX = 8; // TODO: check
var OCTAVES_DEFAULT = 6;
var OCTAVES_MIN = 1;
var OCTAVES_MAX = 30;
var BASE_FREQUENCY_DEFAULT = 100;
var BASE_FREQUENCY_MIN = 1;
var BASE_FREQUENCY_MAX = 20000;
var SENSITIVITY_DEFAULT = 0;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// vars
var node = new Tone.AutoWah();



// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var gainPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Gain", node.gain, {"display": "range", "min": GAIN_MIN, "max": GAIN_MAX}, GAIN_DEFAULT);
var qualityPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Quality", node.Q, {"display": "range", "min": QUALITY_MIN, "max": QUALITY_MIN}, QUALITY_DEFAULT);
var octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
var baseFrequencyPort = op.inValue("Base Frequency", BASE_FREQUENCY_DEFAULT);
var sensitivityPort = op.inValue("Sensitivity", SENSITIVITY_DEFAULT);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
octavesPort.onChange = function() {
    var octaves = octavesPort.get();
    if(octaves && octaves >= OCTAVES_MIN && octaves <= OCTAVES_MAX) {
        node.set("octaves", octavesPort.get());        
    }
};

baseFrequencyPort.onChange = function() {
    var freq = baseFrequencyPort.get();
    if(freq && freq >= BASE_FREQUENCY_MIN && freq <= BASE_FREQUENCY_MAX) {
        node.set("baseFrequency", baseFrequencyPort.get());        
    }
};

sensitivityPort.onChange = function() {
    node.set("sensitivity", sensitivityPort.get());    
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

