CABLES.WEBAUDIO.createAudioContext(op);

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
let MIN_DEFAULT = 0;
let MAX_DEFAULT = 1;
let EXPONENT_DEFAULT = 1;

// vars
let node = new Tone.ScaledEnvelope();

// in ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let attackPort = op.inValueSlider("Attack", ATTACK_DEFAULT);
let decayPort = op.inValueSlider("Decay", DECAY_DEFAULT);
let sustainPort = op.inValueSlider("Sustain", SUSTAIN_DEFAULT);
let releasePort = op.inValueSlider("Release", RELEASE_DEFAULT);
let attackCurvePort = this.addInPort(new CABLES.Port(this, "Attack Curve", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": CURVE_VALUES }));
attackCurvePort.set(ATTACK_CURVE_DEFAULT);
let releaseCurvePort = this.addInPort(new CABLES.Port(this, "Release Curve", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": CURVE_VALUES }));
releaseCurvePort.set(ATTACK_CURVE_DEFAULT);
let minPort = op.inValue("Min", MIN_DEFAULT);
let maxPort = op.inValue("Max", MAX_DEFAULT);
let exponentPort = op.inValue("Exponent", EXPONENT_DEFAULT);

// value change listeners
attackPort.onChange = function ()
{
    setNodeValue("attack", attackPort.get());
};
decayPort.onChange = function ()
{
    setNodeValue("decay", decayPort.get());
};
sustainPort.onChange = function ()
{
    setNodeValue("sustain", sustainPort.get());
};
releasePort.onChange = function ()
{
    setNodeValue("release", releasePort.get());
};
minPort.onChange = function ()
{
    setNodeValue("min", minPort.get());
};
maxPort.onChange = function ()
{
    setNodeValue("max", maxPort.get());
};
exponentPort.onChange = function ()
{
    setNodeValue("exponent", exponentPort.get());
};

function setNodeValue(key, value)
{
    op.log("setting node val: ", value, " for key: ", key);
    node.set(key, value);
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
