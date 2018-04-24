op.name="Panner";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
var PANNING_DEFAULT = 0.0;
var PANNING_MIN = -1.0;
var PANNING_MAX = 1.0;

// vars
var node = new Tone.Panner();

// inputs
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var panningPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Panning", node.pan, {'display': 'range', 'min': PANNING_MIN, 'max': PANNING_MAX}, PANNING_DEFAULT);

//outputs
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};

