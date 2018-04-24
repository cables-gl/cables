op.name="FrequencyEnvelope";

CABLES.WEBAUDIO.createAudioContext(op);

// TODO:
// - baseFrequency can also be in the form "C3", should this be supported?
//   Maybe a conversion op NoteToFrequency is enough

var CURVE_VALUES = [
    "linear",
    "exponential",
    "sine",
    "cosine",
    "bounce",
    "ripple",
    "step"
];

// default values
var ATTACK_DEFAULT = 0.1;
var DECAY_DEFAULT = 0.2;
var SUSTAIN_DEFAULT = 1.0;
var RELEASE_DEFAULT = 0.8;
var ATTACK_CURVE_DEFAULT = "linear";
var RELEASE_CURVE_DEFAULT = "linear";
var EXPONENT_DEFAULT = 2; // ?
var EXPONENT_MIN = 1; // ?
var EXPONENT_MAX = 8; // ?
var BASE_FREQUENCY_DEFAULT = 200;
var BASE_FREQUENCY_MIN = 1;
var BASE_FREQUENCY_MAX = 20000; // ?
var OCTAVES_DEFAULT = 4;
var OCTAVES_MIN = 1;
var OCTAVES_MIN = 12; // ?
var BASE_FREQUENCY_DEFAULT = 200;
var BASE_FREQUENCY_MIN = 0.01;
var BASE_FREQUENCY_MAX = 20000;

// vars
var node = new Tone.FrequencyEnvelope();

// in ports
//var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var baseFrequencyPort = op.inValue("Base Frequency", BASE_FREQUENCY_DEFAULT);
var octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
var attackPort = op.inValueString("Attack", ATTACK_DEFAULT);
var decayPort = op.inValue("Decay", DECAY_DEFAULT);
var sustainPort = op.inValueSlider("Sustain", SUSTAIN_DEFAULT);
var releasePort = op.inValueString("Release", RELEASE_DEFAULT);
var attackCurvePort = this.addInPort( new Port( this, "Attack Curve", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: CURVE_VALUES } ) );
attackCurvePort.set(ATTACK_CURVE_DEFAULT);
var releaseCurvePort = this.addInPort( new Port( this, "Release Curve", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: CURVE_VALUES } ) );
releaseCurvePort.set(ATTACK_CURVE_DEFAULT);
var exponentPort = op.inValue("Exponent", EXPONENT_DEFAULT);

// value change listeners
baseFrequencyPort.onChange = function() { setNodeValue("baseFrequency", baseFrequencyPort.get()); };
octavesPort.onChange = function() { setNodeValue("octaves", octavesPort.get()); };
attackPort.onChange = function() { setNodeValue("attack", attackPort.get()); };
decayPort.onChange = function() { setNodeValue("decay", decayPort.get()); };
sustainPort.onChange = function() { setNodeValue("sustain", sustainPort.get()); };
releasePort.onChange = function() { setNodeValue("release", releasePort.get()); };
attackCurvePort.onChange = function() { setNodeValue("attackCurve", attackCurvePort.get()); };
releaseCurvePort.onChange = function() { setNodeValue("releaseCurve", releaseCurvePort.get()); };

exponentPort.onChange = function() { setNodeValue("exponent", releasePort.get()); };

function setNodeValue(key, value) {
    node.set(key, value);
}

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
