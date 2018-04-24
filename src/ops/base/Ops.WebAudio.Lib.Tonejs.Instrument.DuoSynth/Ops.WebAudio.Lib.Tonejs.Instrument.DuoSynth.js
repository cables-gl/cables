op.name="DuoSynth";

CABLES.WEBAUDIO.createAudioContext(op);

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
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var vibratoAmountPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Vibrato Amount", node.vibratoAmount, null, VIBRATO_AMOUNT_DEFAULT);
var vibratoRatePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Vibrato Rate", node.vibratoRate, null, VIBRATO_RATE_DEFAULT);
var harmonicityPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Harmonicity", node.harmonicity, null, HARMONICITY_DEFAULT);
var portamentoPort = op.inValueString("Portamento", PORTAMENTO_DEFAULT);
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners
portamentoPort.onChange = function() {
    var portamento = portamentoPort.get();
    if(CABLES.WEBAUDIO.isValidToneTime(portamento)) {
        node.set("portamento", portamento);
        op.uiAttr( { 'warning': null } ); // clear warning
        gui.patch().showOpParams(op); // update GUI
    } else {
        op.uiAttr( { 'warning': 'Portamento is not a valid time!' } );
        gui.patch().showOpParams(op); // update GUI
    }
};

//outputs
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};

