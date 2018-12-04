
CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.JCReverb();

// default values
var ROOM_SIZE_DEFAULT = 0.5;
var ROOM_SIZE_MIN = 0.0;
var ROOM_SIZE_MAX = 1.0;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var roomSizePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Room Size", node.roomSize, {"display": "range", "min": ROOM_SIZE_MIN, "max": ROOM_SIZE_MAX}, ROOM_SIZE_DEFAULT);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

