op.name="NoiseSynth";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
var NOISE_TYPES = [
    "white",
    "brown"
];
var NOISE_TYPE_DEFAULT = "white";
var VOLUME_DEFAULT = -6;

// vars
var node = new Tone.NoiseSynth();

// input ports
var noisePort = op.addInPort( new Port( op, "Noise Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: NOISE_TYPES } ) );
noisePort.set(NOISE_TYPE_DEFAULT);
var envelopePort = op.inObject("Envelope");
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners
noisePort.onChange = function() {
    var noise = noisePort.get();
    if(noise && NOISE_TYPES.indexOf(noise) > -1) {
        node.set("noise.type", noise);
    } else {
        op.log("Warning: Invalid noise type! Valid noise types are: ", NOISE_TYPES.toString());
    }
};
envelopePort.onChange = function() {
    var env = envelopePort.get();
    if(env && env.attack && env.decay && env.sustain && env.release) {
        node.set("envelope", env);
    } else {
        op.log("Warning: The envelope cannot be used for the NoiseSynth, maybe try the second envelope output port!?");
    }
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);