op.name="PulseOscillator";

CABLES.WebAudio.createAudioContext(op);

// constants
var WIDTH_DEFAULT = 0.2;
var WIDTH_MIN = 0;
var WIDTH_MAX = 1;
var FREQUENCY_DEFAULT = 440;
var DETUNE_DEFAULT = 0;
var PHASE_DEFAULT = 0;
var PHASE_MIN = 0;
var PHASE_MAX = 180;
var VOLUME_DEFAULT = -6;

// vars
var node = new Tone.PulseOscillator();
node.start();

//inputs
var widthPort = CABLES.WebAudio.createAudioParamInPort(op, "Width", node.width, {'display': 'range', 'min': WIDTH_MIN, 'max': WIDTH_MAX}, WIDTH_DEFAULT);
var frequencyPort = CABLES.WebAudio.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var detunePort = CABLES.WebAudio.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
var phasePort = op.addInPort( new Port( op, "Phase", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PHASE_MIN, 'max': PHASE_MAX } ));
phasePort.set(PHASE_DEFAULT);
var volumePort = CABLES.WebAudio.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);
var mutePort = op.addInPort( new Port( op, "Mute", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );

// change listeners
mutePort.onChange = function() {
    var mute = mutePort.get();
    if(mute) {
        node.mute = mute ? true : false;
    }
};

//outputs
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);



