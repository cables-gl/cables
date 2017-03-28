op.name="AmplitudeEnvelope";

CABLES.WebAudio.createAudioContext(op);

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
var SUSTAIN_DEFAULT = 0.5;
var RELEASE_DEFAULT = 0.8;
var ATTACK_CURVE_DEFAULT = "linear";
var RELEASE_CURVE_DEFAULT = "linear";

// vars
var node = new Tone.AmplitudeEnvelope();
op.log(node.get("sustain"));

// in ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var attackPort = op.inValueSlider("Attack", ATTACK_DEFAULT);
var decayPort = op.inValueSlider("Decay", DECAY_DEFAULT);
var sustainPort = op.inValueSlider("Sustain", SUSTAIN_DEFAULT);
var releasePort = op.inValueSlider("Release", RELEASE_DEFAULT);
var attackCurvePort = this.addInPort( new Port( this, "Attack Curve", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: CURVE_VALUES } ) );
attackCurvePort.set(ATTACK_CURVE_DEFAULT);
var releaseCurvePort = this.addInPort( new Port( this, "Release Curve", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: CURVE_VALUES } ) );
releaseCurvePort.set(ATTACK_CURVE_DEFAULT);

// value change listeners
attackPort.onChange = function() {
    setNodeValue("attack", attackPort.get());    
};
decayPort.onChange = function() {
    setNodeValue("decay", decayPort.get());
};
sustainPort.onChange = function() {
    setNodeValue("sustain", sustainPort.get());    
};
releasePort.onChange = function() {
  setNodeValue("release", releasePort.get());  
};

function setNodeValue(key, value) {
    node.set(key, value);
}

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);
