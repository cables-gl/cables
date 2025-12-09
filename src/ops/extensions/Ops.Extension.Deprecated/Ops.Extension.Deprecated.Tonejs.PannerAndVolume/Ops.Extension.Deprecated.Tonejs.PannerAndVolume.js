CABLES.WEBAUDIO.createAudioContext(op);

// constants
let PANNING_DEFAULT = 0.0;
let PANNING_MIN = -1.0;
let PANNING_MAX = 1.0;
let VOLUME_DEFAULT = 0;
let VOLUME_MIN = -96;
let VOLUME_MAX = 0;

// vars
let node = new Tone.PanVol(PANNING_DEFAULT, VOLUME_DEFAULT);

// inputs
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let panningPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Panning", node.pan, { "display": "range", "min": PANNING_MIN, "max": PANNING_MAX }, PANNING_DEFAULT);
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, { "display": "range", "min": VOLUME_MIN, "max": VOLUME_MAX }, VOLUME_DEFAULT);

// outputs
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
