CABLES.WEBAUDIO.createAudioContext(op);

// default values
let THRESHOLD_DEFAULT = -40;
let THRESHOLD_MIN = -100;
let THRESHOLD_MAX = 0;
let ATTACK_DEFAULT = 0.1;
let RELEASE_DEFAULT = 0.1;

// vars
let node = new Tone.Gate(THRESHOLD_DEFAULT, ATTACK_DEFAULT, RELEASE_DEFAULT);

// in ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let thresholdPort = op.addInPort(new CABLES.Port(this, "Threshold", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": THRESHOLD_MIN, "max": THRESHOLD_MAX }, THRESHOLD_DEFAULT));
thresholdPort.set(THRESHOLD_DEFAULT);
let attackPort = op.inValueString("Attack", ATTACK_DEFAULT);
thresholdPort.set(ATTACK_DEFAULT);
let releasePort = op.inValueString("Release", RELEASE_DEFAULT);
thresholdPort.set(RELEASE_DEFAULT);

// value change listeners
attackPort.onChange = function () { setNodeValue("attack", attackPort.get()); };
releasePort.onChange = function () { setNodeValue("release", releasePort.get()); };
thresholdPort.onChange = function () { setNodeValue("threshold", thresholdPort.get()); };

function setNodeValue(key, value)
{
    node.set(key, value);
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
