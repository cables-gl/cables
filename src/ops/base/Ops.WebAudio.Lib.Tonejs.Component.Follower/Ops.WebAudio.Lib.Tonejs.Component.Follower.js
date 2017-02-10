op.name="Follower";

CABLES.WebAudio.createAudioContext(op);

// constants
var ATTACK_DEFAULT = 0.05;
var RELEASE_DEFAULT = 0.5;

// vars
var node = new Tone.Follower(ATTACK_DEFAULT, RELEASE_DEFAULT);

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var attackPort = op.inValueSlider("Attack", ATTACK_DEFAULT);
var releasePort = op.inValueSlider("Release", RELEASE_DEFAULT);

// change listeners
attackPort.onChange = function() {
    node.set("attack", attackPort.get());        
};
releasePort.onChange = function() {
    node.set("release", releasePort.get());        
};

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);