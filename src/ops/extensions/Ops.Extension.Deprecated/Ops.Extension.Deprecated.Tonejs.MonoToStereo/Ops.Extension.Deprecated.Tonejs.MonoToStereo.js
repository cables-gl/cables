CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.Merge();

// input ports
let leftAudioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Left", node.left);
let rightAudioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Right", node.right);

// output ports
let stereoAudioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Stereo", node);

op.onDelete = function ()
{
    node.dispose();
};
