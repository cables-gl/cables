CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.AutoPanner().start(); // TODO: create start / stop nodes!?

// default values
let DEPTH_DEFAULT = 1;
let DEPTH_MIN = 0;
let DEPTH_MAX = 1;
let FREQUENCY_DEFAULT = 1;
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let depthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Depth", node.depth, { "display": "range", "min": DEPTH_MIN, "max": DEPTH_MAX }, DEPTH_DEFAULT);
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, WET_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
