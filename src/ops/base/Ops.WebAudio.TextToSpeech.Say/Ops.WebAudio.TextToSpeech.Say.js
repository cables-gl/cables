op.name="Say";

// default / min /max values
var PITCH_DEFAULT = 1;
var PITCH_MIN = 0;
var PITCH_MAX = 2;
var RATE_DEFAULT = 1;
var RATE_MIN = 0.1;
var RATE_MAX = 10;
var VOLUME_DEFAULT = 1;
var VOLUME_MIN = 0;
var VOLUME_MAX = 1;

// vars
var synth = window.speechSynthesis;
var voiceMap = getVoiceMap(synth.getVoices());
var voiceMapKeys = Object.keys(voiceMap);

// inputs
var updateStatePort = op.inTrigger("Update State");
var textPort = op.inValueString("Text", "Wazzup");
var triggerPort = op.inFunctionButton("Say");
var voicePort = op.addInPort( new CABLES.Port( op, "Voice", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: voiceMapKeys } ) );
var pitchPort = op.addInPort( new CABLES.Port( op, "Pitch", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PITCH_MIN, 'max': PITCH_MAX } ));
pitchPort.set(PITCH_DEFAULT);
var ratePort = op.addInPort( new CABLES.Port( op, "Rate", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': RATE_MIN, 'max': RATE_MAX } ));
ratePort.set(RATE_DEFAULT);
var volumePort = op.addInPort( new CABLES.Port( op, "Volume", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX } ));
volumePort.set(VOLUME_DEFAULT);
var sayOnTextChangePort = op.inValueBool("Say on Text Change", false);
var pausePort = op.inFunctionButton("Pause");
var resumePort = op.inFunctionButton("Resume");
var cancelPort = op.inFunctionButton("Cancel");

// outputs
var nextPort = op.outTrigger("Next");
var speakingPort = op.outValue("Speaking", false);
var pendingPort = op.outValue("Pending", false);
var pausedPort = op.outValue("Paused", false);

// change listeners
updateStatePort.onTriggered = updateState;
triggerPort.onTriggered = say;
sayOnTextChangePort.onChange = function() {
    if(sayOnTextChangePort.get()) {
        textPort.onChange = say;
    } else {
        textPort.onChange = function() {}; // don't do anything
    }
}
pausePort.onTriggered = function() {
    synth.pause();
};
resumePort.onTriggered = function() {
    synth.resume();
};
cancelPort.onTriggered = function() {
    synth.cancel();
};

// voices loaded callback (async)
window.speechSynthesis.onvoiceschanged = function() {
    voiceMap = getVoiceMap(synth.getVoices());
    voiceMapKeys = Object.keys(voiceMap);
    if(CABLES.UI) {
        voicePort.uiAttribs.values = voiceMapKeys; // update dropdown values
        gui.patch().showOpParams(op); // update visible dropdown menu
    }
};

/**
 * Updates the state output ports
 */
function updateState() {
    speakingPort.set(synth.speaking);
    pendingPort.set(synth.pending);
    pausedPort.set(synth.paused);
    nextPort.trigger();
}

/**
 * says the text from text-port using voice voice
 */
function say() {
    var text = textPort.get();
    var voice;
    var voiceDisplayName = voicePort.get();
    if( voiceDisplayName && voiceMap.hasOwnProperty(voiceDisplayName)) { // voices are loaded async, at start it may not be there
        voice = voiceMap[voiceDisplayName];
    }
    var utterance = new SpeechSynthesisUtterance(text);
    if(voice) {
        utterance.voice = voice;    
    }
    var pitch = pitchPort.get();
    if(pitch < PITCH_MIN) { pitch = PITCH_MIN; }
    else if(pitch > PITCH_MAX) { pitch = PITCH_MAX; }
    utterance.pitch = pitch;
    var rate = ratePort.get();
    if(rate < RATE_MIN) { rate = RATE_MIN; }
    else if(rate > RATE_MAX) { rate = RATE_MAX; }
    utterance.rate = rate;
    var volume = volumePort.get();
    if(volume < VOLUME_MIN) { volume = VOLUME_MIN; }
    else if(volume > VOLUME_MAX) { volume = VOLUME_MAX; }
    utterance.volume = volume;
    synth.speak(utterance);
}

/**
 * Returns a map of voices
 * e.g. { "Alex (de-DE)": { voice object }, ...}
 */
function getVoiceMap(voices) {
    var ret = {};
    if(!voices || voices.length === 0) { return ret; }
    
    voices.forEach(function (voice) {
        var key = voice.name + " (" + voice.lang + ")"
        ret[key] = voice;
    });
    return ret;
}
