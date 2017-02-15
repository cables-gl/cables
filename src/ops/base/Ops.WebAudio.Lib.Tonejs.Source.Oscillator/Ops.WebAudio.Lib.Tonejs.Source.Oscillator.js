op.name="Oscillator";

CABLES.WebAudio.createAudioContext(op);

// defaults
var TYPES = [
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
var NORMAL_RANGE_MIN = 0;
var NORMAL_RANGE_MAX = 1;

var FREQUENCY_DEFAULT = 440;
var TYPE_DEFAULT = "sine";
var DETUNE_DEFAULT = 0;
var PHASE_DEFAULT = 0;
var PHASE_MIN = 0;
var PHASE_MAX = 180;
var VOLUME_DEFAULT = -6;
var VOLUME_MIN = -100;
var VOLUME_MAX = 0;

// vars
var node = new Tone.Oscillator(FREQUENCY_DEFAULT, TYPE_DEFAULT).start();

// input ports
var frequencyPort = CABLES.WebAudio.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var detunePort = CABLES.WebAudio.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
var typePort = op.addInPort( new Port( op, "Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES } ) );
typePort.set("sine");
var phasePort = op.addInPort( new Port( op, "Phase", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PHASE_MIN, 'max': PHASE_MAX }, PHASE_DEFAULT ));
phasePort.set(PHASE_DEFAULT);

var volumePort = CABLES.WebAudio.createAudioParamInPort(op, "Volume", node.volume, {'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX}, VOLUME_DEFAULT);
//volumePort.set(VOLUME_DEFAULT);

var mutePort = op.addInPort( new Port( op, "Mute", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(false);

// change listeners
typePort.onChange = function() {setNodeValue("type", typePort.get());};
phasePort.onChange = function() {setNodeValue("phase", phasePort.get());};
mutePort.onChange = function() {setNodeValue("mute", mutePort.get());};


// functions
function setNodeValue(key, value) {
    op.log("setting key: ", key, " to value: ", value);
    try{
        node.set(key, value);    
    } catch(e) {
        op.log("ERROR!", e);
    }
}

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);