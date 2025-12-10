CABLES.WEBAUDIO.createAudioContext(op);

// TODO:
// - baseFrequency can also be in the form "C3", should this be supported?
//   Maybe a conversion op NoteToFrequency is enough

let CURVE_VALUES = [
    "linear",
    "exponential",
    "sine",
    "cosine",
    "bounce",
    "ripple",
    "step"
];

// default values
let ATTACK_DEFAULT = 0.1;
let DECAY_DEFAULT = 0.2;
let SUSTAIN_DEFAULT = 1.0;
let RELEASE_DEFAULT = 0.8;
let ATTACK_CURVE_DEFAULT = "linear";
let RELEASE_CURVE_DEFAULT = "linear";
let EXPONENT_DEFAULT = 2; // ?
let EXPONENT_MIN = 1; // ?
let EXPONENT_MAX = 8; // ?
var BASE_FREQUENCY_DEFAULT = 200;
var BASE_FREQUENCY_MIN = 1;
var BASE_FREQUENCY_MAX = 20000; // ?
let OCTAVES_DEFAULT = 4;
var OCTAVES_MIN = 1;
var OCTAVES_MIN = 12; // ?
var BASE_FREQUENCY_DEFAULT = 200;
var BASE_FREQUENCY_MIN = 0.01;
var BASE_FREQUENCY_MAX = 20000;

// vars
let node = new Tone.FrequencyEnvelope();

// in ports
// var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let baseFrequencyPort = op.inValue("Base Frequency", BASE_FREQUENCY_DEFAULT);
let octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
let attackPort = op.inValueString("Attack", ATTACK_DEFAULT);
let decayPort = op.inValue("Decay", DECAY_DEFAULT);
let sustainPort = op.inValueSlider("Sustain", SUSTAIN_DEFAULT);
let releasePort = op.inValueString("Release", RELEASE_DEFAULT);
let attackCurvePort = this.addInPort(new CABLES.Port(this, "Attack Curve", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": CURVE_VALUES }));
attackCurvePort.set(ATTACK_CURVE_DEFAULT);
let releaseCurvePort = this.addInPort(new CABLES.Port(this, "Release Curve", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": CURVE_VALUES }));
releaseCurvePort.set(ATTACK_CURVE_DEFAULT);
let exponentPort = op.inValue("Exponent", EXPONENT_DEFAULT);

// value change listeners
baseFrequencyPort.onChange = function () { setNodeValue("baseFrequency", baseFrequencyPort.get()); };
octavesPort.onChange = function () { setNodeValue("octaves", octavesPort.get()); };
attackPort.onChange = function () { setNodeValue("attack", attackPort.get()); };
decayPort.onChange = function () { setNodeValue("decay", decayPort.get()); };
sustainPort.onChange = function () { setNodeValue("sustain", sustainPort.get()); };
releasePort.onChange = function () { setNodeValue("release", releasePort.get()); };
attackCurvePort.onChange = function () { setNodeValue("attackCurve", attackCurvePort.get()); };
releaseCurvePort.onChange = function () { setNodeValue("releaseCurve", releaseCurvePort.get()); };

exponentPort.onChange = function () { setNodeValue("exponent", releasePort.get()); };

function setNodeValue(key, value)
{
    node.set(key, value);
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
