CABLES.WEBAUDIO.createAudioContext(op);

// TODO: Should this have two internal gain nodes, so users
// so not add two gain before?

// defaults
let FADE_DEFAULT = 0.5;
let FADE_MIN = 0;
let FADE_MAX = 1;

// vars
let node = new Tone.CrossFade();

// input ports
let audioInPort1 = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In 1", node.input[0]);
let audioInPort2 = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In 2", node.input[1]);
let fadePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Fade", node.fade, { "display": "range", "min": FADE_MIN, "max": FADE_MAX }, FADE_DEFAULT);

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
