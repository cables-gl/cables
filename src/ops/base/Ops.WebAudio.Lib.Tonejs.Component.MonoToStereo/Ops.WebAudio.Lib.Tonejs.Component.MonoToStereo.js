op.name="MonoToStereo";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.Merge();

// input ports
var leftAudioInPort = CABLES.WebAudio.createAudioInPort(op, "Left", node.left);
var rightAudioInPort = CABLES.WebAudio.createAudioInPort(op, "Right", node.right);

// output ports
var stereoAudioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Stereo", node);

op.onDelete = function() {
    node.dispose();
};