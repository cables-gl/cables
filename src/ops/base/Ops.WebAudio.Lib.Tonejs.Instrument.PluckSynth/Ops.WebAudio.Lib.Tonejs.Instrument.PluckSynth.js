op.name="PluckSynth";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
var ATTACK_NOISE_DEFAULT = 1;
var ATTACK_NOISE_MIN = 0.1;
var ATTACK_NOISE_MAX = 20;
var VOLUME_DEFAULT = -6;
var RESONANCE_DEFAULT = 0.9;
var RESONANCE_MIN = 0;
var RESONANCE_MAX = 1;
var DAMPENING_DEFAULT = 4000;
var DAMPENING_MIN = 50;
var DAMPENING_MAX = 10000;

// vars
var node = new Tone.PluckSynth();

// input ports
var attackNoisePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Attack Noise", node.attackNoise, {'display': 'range', 'min': ATTACK_NOISE_MIN, 'max': ATTACK_NOISE_MAX}, ATTACK_NOISE_DEFAULT);
var resonancePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Resonance", node.resonance, {'display': 'range', 'min': RESONANCE_MIN, 'max': RESONANCE_MAX}, RESONANCE_DEFAULT);
var dampeningPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Dampening", node.dampening, {'display': 'range', 'min': DAMPENING_MIN, 'max': DAMPENING_MAX}, DAMPENING_DEFAULT);
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners


// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);