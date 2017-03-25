op.name="StereoToMono";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.Split();

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Stereo", node);

// output ports
var leftAudioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Left", node.left);
var rightAudioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Right", node.right);

op.onDelete = function() {
    node.dispose();
};