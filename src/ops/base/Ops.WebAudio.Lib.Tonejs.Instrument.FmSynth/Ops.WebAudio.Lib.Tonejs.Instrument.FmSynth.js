op.name="FmSynth";

CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var FREQUENCY_DEFAULT = 440;
var DETUNE_DEFAULT = 0;
var HARMONICITY_DEFAULT = 3;
var PARTAMENTO_DEFAULT = "16n";
var VOLUME_DEFAULT = -4;
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
var OSCILLATOR_TYPE_DEFAULT = "sine";
var MODULATION_OSCILLATOR_TYPE_DEFAULT = "sine";
var MODULATION_INDEX_DEFAULT = 10;

// vars
var node = new Tone.FMSynth();

// inputs
//var oscillatorPort = op.inObject("Oscillator");
var oscillatorPort = op.addInPort( new CABLES.Port( op, "Oscillator Type", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: OSCILLATOR_TYPES } ) );
oscillatorPort.set(OSCILLATOR_TYPE_DEFAULT);
var envelopePort = op.inObject("Envelope");
//var modulationOscillatorPort = op.inObject("Modulation Oscillator");
var modulationOscillatorPort = op.addInPort( new CABLES.Port( op, "Modulation Oscillator Type", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: OSCILLATOR_TYPES } ) );
modulationOscillatorPort.set(MODULATION_OSCILLATOR_TYPE_DEFAULT);
var modulationIndexPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Modulation Index", node.modulationIndex, null, MODULATION_INDEX_DEFAULT);
var modulationEnvelopePort = op.inObject("Modulation Envelope");
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
var harmonicityPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Harmonicity", node.harmonicity, null, HARMONICITY_DEFAULT);
var portamentoPort = op.inValueString("Partamento", PARTAMENTO_DEFAULT);
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners
oscillatorPort.onChange = function() {
    setNodeValue("oscillator", {type: oscillatorPort.get()});
};
envelopePort.onChange = function() {
    setNodeValue("envelope", envelopePort.get());
};
modulationOscillatorPort.onChange = function() {
    setNodeValue("modulation", { type: modulationOscillatorPort.get() });
};
modulationEnvelopePort.onChange = function() {
    setNodeValue("modulationEnvelope", modulationEnvelopePort.get());
};
portamentoPort.onChange = function() {
    var portamento = portamentoPort.get();
    if(isValidTime(portamento)) {
        setNodeValue("portamento", portamento);
        op.uiAttr( { 'warning': null } );
    } else {
        op.uiAttr( { 'warning': 'Partamento time is not valid! Try "16n" or "0.123' } );
    }
};


// functions
function setNodeValue(key, val) {
    if(key && typeof val !== 'undefined') {
        op.log("FMSynth set key: " + key + " to: ", val);
        node.set(key, val);
    }
}

function isValidTime(time) {
    try {
        new Tone.TimeBase(time);
        return true;
    } catch(e) {
        return false;
    }
}


// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

