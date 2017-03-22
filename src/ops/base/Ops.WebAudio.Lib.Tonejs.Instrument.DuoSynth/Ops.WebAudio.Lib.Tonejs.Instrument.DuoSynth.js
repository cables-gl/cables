op.name="DuoSynth";

// constants
var FREQUENCY_DEFAULT = 440;
var VIBRATO_AMOUNT_DEFAULT = 0.5;
var VIBRATO_RATE_DEFAULT = 5;
var HARMONICITY_DEFAULT = 1.5;
var PORTAMENTO_DEFAULT = 0;
var VOLUME_DEFAULT = -6;

// vars
var node = new Tone.DuoSynth();

// inputs
var frequencyPort = CABLES.WebAudio.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var vibratoAmountPort = CABLES.WebAudio.createAudioParamInPort(op, "Vibrato Amount", node.vibratoAmount, null, VIBRATO_AMOUNT_DEFAULT);
var vibratoRatePort = CABLES.WebAudio.createAudioParamInPort(op, "Vibrato Rate", node.vibratoRate, null, VIBRATO_RATE_DEFAULT);
var harmonicityPort = CABLES.WebAudio.createAudioParamInPort(op, "Harmonicity", node.harmonicity, null, HARMONICITY_DEFAULT);
var portamentoPort = op.inValueString("Portamento", PORTAMENTO_DEFAULT);
var volumePort = CABLES.WebAudio.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners
portamentoPort.onChange = function() {
    var portamento = portamentoPort.get();
    if(CABLES.WebAudio.isValidToneTime(portamento)) {
        node.set("portamento", portamento);
        op.uiAttr( { 'warning': null } ); // clear warning
        gui.patch().showOpParams(op); // update GUI
    } else {
        op.uiAttr( { 'warning': 'Portamento is not a valid time!' } );
        gui.patch().showOpParams(op); // update GUI
    }
};

//outputs
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};

