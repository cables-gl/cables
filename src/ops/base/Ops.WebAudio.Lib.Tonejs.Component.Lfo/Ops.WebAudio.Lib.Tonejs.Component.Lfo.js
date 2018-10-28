op.name="Lfo";

CABLES.WEBAUDIO.createAudioContext(op);

// TODO:
// - Add units?
// - Support Frequency as "C4"?

// defaults
var TYPES = ["sine", "square", "triangle", "sawtooth"];
var NORMAL_RANGE_MIN = 0;
var NORMAL_RANGE_MAX = 1;

var FREQUENCY_DEFAULT = 0.5;
var AMPLITUDE_DEFAULT = 1.0;
var MIN_DEFAULT = 0;
var MAX_DEFAULT = 1;
var TYPE_DEFAULT = "sine";
var PHASE_DEFAULT = 0;
var PHASE_MIN = 0;
var PHASE_MAX = 180;
var MUTE_DEFAULT = false;
var DETUNE_DEFAULT = 0;
var VOLUME_DEFAULT = -6;
var VOLUME_MIN = -100;
var VOLUME_MAX = 0;

// vars
var node = new Tone.LFO(FREQUENCY_DEFAULT, MIN_DEFAULT, MAX_DEFAULT).start();

// input ports
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var amplitudePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Amplitude", node.amplitude, AMPLITUDE_DEFAULT);
var minPort = op.inValue("Min", MIN_DEFAULT);
var maxPort = op.inValue("Max", MAX_DEFAULT);
var typePort = op.addInPort( new CABLES.Port( op, "Type", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES } ) );
typePort.set("sine");
var phasePort = op.addInPort( new CABLES.Port( op, "Phase", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PHASE_MIN, 'max': PHASE_MAX }, PHASE_DEFAULT ));
phasePort.set(PHASE_DEFAULT);
// TODO: volume should be a dynamic port, but must be changed like this: node.volume.value, not node.set("volume", volume);
//var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, {'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX}, VOLUME_DEFAULT);
var volumePort = op.addInPort( new CABLES.Port( op, "Volume", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX } ));
volumePort.set(VOLUME_DEFAULT);

var mutePort = op.addInPort( new CABLES.Port( op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(false);

// change listeners
minPort.onChange = function() {setNodeValue("min", minPort.get());};
maxPort.onChange = function() {setNodeValue("max", maxPort.get());};
typePort.onChange = function() {setNodeValue("type", typePort.get());};
phasePort.onChange = function() {setNodeValue("phase", phasePort.get());};
mutePort.onChange = function() {setNodeValue("mute", mutePort.get());};
volumePort.onChange = function() {
    var volume = volumePort.get();
    if(volume >= VOLUME_MIN && volume <= VOLUME_MAX) {
        try{
            node.set("volume", volume);
        } catch(e) {
            op.log(e);
        }
    } else {
        op.log("Volume out of range: ", volume);
    }
};


// functions
function setNodeValue(key, value) {
    node.set(key, value);
}

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);