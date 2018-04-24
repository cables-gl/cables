op.name="CrossFade";

CABLES.WEBAUDIO.createAudioContext(op);

// TODO: Should this have two internal gain nodes, so users 
// so not add two gain before?

// defaults
var FADE_DEFAULT = 0.5;
var FADE_MIN = 0;
var FADE_MAX = 1;

// vars
var node = new Tone.CrossFade();

// input ports
var audioInPort1 = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In 1", node.input[0]);
var audioInPort2 = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In 2", node.input[1]);
var fadePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Fade", node.fade, {"display": "range", "min": FADE_MIN, "max": FADE_MAX}, FADE_DEFAULT);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);