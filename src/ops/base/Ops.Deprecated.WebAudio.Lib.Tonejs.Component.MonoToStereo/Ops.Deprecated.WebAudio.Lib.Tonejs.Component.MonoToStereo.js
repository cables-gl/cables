
CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.Merge();

// input ports
var leftAudioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Left", node.left);
var rightAudioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Right", node.right);

// output ports
var stereoAudioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Stereo", node);

op.onDelete = function() {
    node.dispose();
};