CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let NORMAL_RANGE_MIN = 0;
let NORMAL_RANGE_MAX = 1;

let DELAY_TIME_DEFAULT = 0.1;
let RESONANCE_DEFAULT = 0.5;

// vars
let node = new Tone.FeedbackCombFilter(DELAY_TIME_DEFAULT, RESONANCE_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let delayTimePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Delay Time", node.delayTime, { "type": "string" }, DELAY_TIME_DEFAULT);
let resonancePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Resonance", node.resonance, { "display": "range", "min": NORMAL_RANGE_MIN, "max": NORMAL_RANGE_MAX }, RESONANCE_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
