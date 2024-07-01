CABLES.WEBAUDIO.createAudioContext(op);

// constants
let FREQUENCY_DEFAULT = 440;
let VIBRATO_AMOUNT_DEFAULT = 0.5;
let VIBRATO_RATE_DEFAULT = 5;
let HARMONICITY_DEFAULT = 1.5;
let PORTAMENTO_DEFAULT = 0;
let VOLUME_DEFAULT = -6;

// vars
let node = new Tone.DuoSynth();

// inputs
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
let vibratoAmountPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Vibrato Amount", node.vibratoAmount, null, VIBRATO_AMOUNT_DEFAULT);
let vibratoRatePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Vibrato Rate", node.vibratoRate, null, VIBRATO_RATE_DEFAULT);
let harmonicityPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Harmonicity", node.harmonicity, null, HARMONICITY_DEFAULT);
let portamentoPort = op.inValueString("Portamento", PORTAMENTO_DEFAULT);
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners
portamentoPort.onChange = function ()
{
    let portamento = portamentoPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(portamento))
    {
        node.set("portamento", portamento);
        op.uiAttr({ "warning": null }); // clear warning
        op.refreshParams();
    }
    else
    {
        op.uiAttr({ "warning": "Portamento is not a valid time!" });
        op.refreshParams();
    }
};

// outputs
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
