CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.Split();

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Stereo", node);

// output ports
let leftAudioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Left", node.left);
let rightAudioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Right", node.right);

op.onDelete = function ()
{
    node.dispose();
};
