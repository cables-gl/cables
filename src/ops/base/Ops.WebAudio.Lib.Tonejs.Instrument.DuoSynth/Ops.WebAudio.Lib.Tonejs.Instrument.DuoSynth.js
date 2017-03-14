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
var voice1Port = op.inObject("MonoSynth 1");
voice1Port.shouldLink = canLinkVoicePort;
var voice2Port = op.inObject("MonoSynth 2");
voice2Port.shouldLink = canLinkVoicePort;
var volumePort = CABLES.WebAudio.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);


// functions
// checks if another object port can connect
function canLinkVoicePort(p1, p2) {
    if(p1 == this && isMonoSynth(p2)) return true;
    if(p2 == this && isMonoSynth(p2)) return true;
    return false; // no monosynth object
}

function isMonoSynth(o){
    return o instanceof Tone.MonoSynth;
}

// change listeners
voice1Port.onChange = function() {
    var voice1 = voice1Port.get();
    if(voice1) {
        if(isMonoSynth(voice1)) {
                
        } else {
            // TODO: Show warning
        }    
    }
};

//outputs
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function() {
    node.dispose();
};

