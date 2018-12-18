
CABLES.WEBAUDIO.createAudioContext(op);

// default values
var THRESHOLD_DEFAULT = -40;
var THRESHOLD_MIN = -100;
var THRESHOLD_MAX = 0;
var ATTACK_DEFAULT = 0.1;
var RELEASE_DEFAULT = 0.1;

// vars
var node = new Tone.Gate(THRESHOLD_DEFAULT, ATTACK_DEFAULT, RELEASE_DEFAULT);

// in ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var thresholdPort = op.addInPort( new CABLES.Port( this, "Threshold", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': THRESHOLD_MIN, 'max': THRESHOLD_MAX }, THRESHOLD_DEFAULT ));
thresholdPort.set(THRESHOLD_DEFAULT);
var attackPort = op.inValueString("Attack", ATTACK_DEFAULT);
thresholdPort.set(ATTACK_DEFAULT);
var releasePort = op.inValueString("Release", RELEASE_DEFAULT);
thresholdPort.set(RELEASE_DEFAULT);

// value change listeners
attackPort.onChange = function(){setNodeValue("attack", attackPort.get());};
releasePort.onChange = function(){setNodeValue("release", releasePort.get());};
thresholdPort.onChange = function(){setNodeValue("threshold", thresholdPort.get());};

function setNodeValue(key, value) {
    node.set(key, value);
}

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
