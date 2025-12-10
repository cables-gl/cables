CABLES.WEBAUDIO.createAudioContext(op);

// constants
let ATTACK_NOISE_DEFAULT = 1;
let ATTACK_NOISE_MIN = 0.1;
let ATTACK_NOISE_MAX = 20;
let VOLUME_DEFAULT = -6;
let RESONANCE_DEFAULT = 0.9;
let RESONANCE_MIN = 0;
let RESONANCE_MAX = 1;
let DAMPENING_DEFAULT = 4000;
let DAMPENING_MIN = 50;
let DAMPENING_MAX = 10000;

// vars
let node = new Tone.PluckSynth();

// input ports
let attackNoisePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Attack Noise", node.attackNoise, { "display": "range", "min": ATTACK_NOISE_MIN, "max": ATTACK_NOISE_MAX }, ATTACK_NOISE_DEFAULT);
let resonancePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Resonance", node.resonance, { "display": "range", "min": RESONANCE_MIN, "max": RESONANCE_MAX }, RESONANCE_DEFAULT);
let dampeningPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Dampening", node.dampening, { "display": "range", "min": DAMPENING_MIN, "max": DAMPENING_MAX }, DAMPENING_DEFAULT);
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
