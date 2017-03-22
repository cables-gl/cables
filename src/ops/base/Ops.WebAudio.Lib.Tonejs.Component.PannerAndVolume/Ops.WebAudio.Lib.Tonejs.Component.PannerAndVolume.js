op.name="PannerAndVolume";

CABLES.WebAudio.createAudioContext(op);

// constants
var PANNING_DEFAULT = 0.0;
var PANNING_MIN = -1.0;
var PANNING_MAX = 1.0;
var VOLUME_DEFAULT = 0;
var VOLUME_MIN = -96;
var VOLUME_MAX = 0;

// vars
var node = new Tone.PanVol(PANNING_DEFAULT, VOLUME_DEFAULT);

// inputs
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var panningPort = CABLES.WebAudio.createAudioParamInPort(op, "Panning", node.pan, {'display': 'range', 'min': PANNING_MIN, 'max': PANNING_MAX}, PANNING_DEFAULT);
var volumePort = CABLES.WebAudio.createAudioParamInPort(op, "Volume", node.volume, {'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX}, VOLUME_DEFAULT);

//outputs
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};

