// TODO: Update UI when port is replaced

// constants
let FREQUENCY_DEFAULT = 440;
let DETUNE_DEFAULT = 0;
let VOLUME_DEFAULT = -6;

// vars
let node = new Tone.MonoSynth();

// inputs
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
let detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
let portamentoPort = op.inValueString("Portamento (Time)");
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// functions
/*
function shouldLinkOmniOscillator(p1, p2) {
    if(p1 == this && p2 instanceof OmniOscillator) return true;
    if(p2 == this && p1 instanceof OmniOscillator) return true;
    return false; // no MonoSynth object
}

function shouldLinkAmplitudeEnvelope(p1, p2) {
    if(p1 == this && p2 instanceof AmplitudeEnvelope) return true;
    if(p2 == this && p1 instanceof AmplitudeEnvelope) return true;
    return false; // no MonoSynth object
}

function shouldLinkFrequencyEnvelope() {
    if(p1 == this && p2 instanceof FrequencyEnvelope) return true;
    if(p2 == this && p1 instanceof FrequencyEnvelope) return true;
    return false; // no MonoSynth object
}

function shouldLinkFilter(p1, p2) {
    if(p1 == this && p2 instanceof Filter) return true;
    if(p2 == this && p1 instanceof Filter) return true;
    return false; // no MonoSynth object
}
*/

// change listeners
portamentoPort.onChange = function ()
{
    let portamento = portamentoPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(portamento))
    {
        node.set("portamento", portamento);
        op.uiAttr({ "warning": null });
        op.refreshParams();
    }
    else
    {
        op.uiAttr({ "warning": "Portamento is not a valid tone time" });
        op.refreshParams();
    }
};

// outputs
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
// var oscillatorPort = op.outObject("OmniOscillator");
// oscillatorPort.shouldLink = shouldLinkOmniOscillator;
// var filterPort = op.outObject("Filter");
// filterPort.shouldLink = shouldLinkFilter;
// var envelopePort = op.outObject("Envelope (AmplitudeEnvelope)");
// envelopePort.shouldLink = shouldLinkAmplitudeEnvelope;
// var filterEnvelopePort = op.outObject("Filter Envelope (FrequencyEnvelope)");
// filterEnvelopePort.shouldLink = shouldLinkFrequencyEnvelope;

audioOutPort.set(node);
/*
oscillatorPort.set(node.oscillator);
filterPort.set(node.filter);
envelopePort.set(node.envelope);
filterEnvelopePort.set(node.filterEnvelope);
*/

// clean up
op.onDelete = function ()
{
    if (node) node.dispose();
};
