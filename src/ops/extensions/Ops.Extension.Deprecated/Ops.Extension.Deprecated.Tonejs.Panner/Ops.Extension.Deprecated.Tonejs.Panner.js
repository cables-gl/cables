CABLES.WEBAUDIO.createAudioContext(op);

// constants
let PANNING_DEFAULT = 0.0;
let PANNING_MIN = -1.0;
let PANNING_MAX = 1.0;

// vars
let node = new Tone.Panner();

// inputs
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let panningPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Panning", node.pan, { "display": "range", "min": PANNING_MIN, "max": PANNING_MAX }, PANNING_DEFAULT);

// outputs
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
