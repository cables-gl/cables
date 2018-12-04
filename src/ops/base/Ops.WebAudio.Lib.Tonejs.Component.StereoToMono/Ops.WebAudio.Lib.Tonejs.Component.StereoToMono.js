
CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.Split();

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Stereo", node);

// output ports
var leftAudioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Left", node.left);
var rightAudioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Right", node.right);

op.onDelete = function() {
    node.dispose();
};