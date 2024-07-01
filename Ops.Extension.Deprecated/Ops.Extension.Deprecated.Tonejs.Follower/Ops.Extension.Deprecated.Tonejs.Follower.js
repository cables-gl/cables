CABLES.WEBAUDIO.createAudioContext(op);

// constants
let ATTACK_DEFAULT = 0.05;
let RELEASE_DEFAULT = 0.5;

// vars
let node = new Tone.Follower(ATTACK_DEFAULT, RELEASE_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let attackPort = op.inValueSlider("Attack", ATTACK_DEFAULT);
let releasePort = op.inValueSlider("Release", RELEASE_DEFAULT);

// change listeners
attackPort.onChange = function ()
{
    node.set("attack", attackPort.get());
};
releasePort.onChange = function ()
{
    node.set("release", releasePort.get());
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
