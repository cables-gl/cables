// default / min /max values
let PITCH_DEFAULT = 1;
let PITCH_MIN = 0;
let PITCH_MAX = 2;
let RATE_DEFAULT = 1;
let RATE_MIN = 0.1;
let RATE_MAX = 10;
let VOLUME_DEFAULT = 1;
let VOLUME_MIN = 0;
let VOLUME_MAX = 1;

// vars
let synth = window.speechSynthesis;
let voiceMap = getVoiceMap(synth.getVoices());
let voiceMapKeys = Object.keys(voiceMap);

// inputs
let updateStatePort = op.inTrigger("Update State");
let textPort = op.inValueString("Text", "Wazzup");
let triggerPort = op.inTriggerButton("Say");
let voicePort = op.addInPort(new CABLES.Port(op, "Voice", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": voiceMapKeys }));
let pitchPort = op.addInPort(new CABLES.Port(op, "Pitch", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": PITCH_MIN, "max": PITCH_MAX }));
pitchPort.set(PITCH_DEFAULT);
let ratePort = op.addInPort(new CABLES.Port(op, "Rate", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": RATE_MIN, "max": RATE_MAX }));
ratePort.set(RATE_DEFAULT);
let volumePort = op.addInPort(new CABLES.Port(op, "Volume", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": VOLUME_MIN, "max": VOLUME_MAX }));
volumePort.set(VOLUME_DEFAULT);
let sayOnTextChangePort = op.inValueBool("Say on Text Change", false);
let pausePort = op.inTriggerButton("Pause");
let resumePort = op.inTriggerButton("Resume");
let cancelPort = op.inTriggerButton("Cancel");

// outputs
let nextPort = op.outTrigger("Next");
let speakingPort = op.outValue("Speaking", false);
let pendingPort = op.outValue("Pending", false);
let pausedPort = op.outValue("Paused", false);

// change listeners
updateStatePort.onTriggered = updateState;
triggerPort.onTriggered = say;
sayOnTextChangePort.onChange = function ()
{
    if (sayOnTextChangePort.get())
    {
        textPort.onChange = say;
    }
    else
    {
        textPort.onChange = function () {}; // don't do anything
    }
};
pausePort.onTriggered = function ()
{
    synth.pause();
};
resumePort.onTriggered = function ()
{
    synth.resume();
};
cancelPort.onTriggered = function ()
{
    synth.cancel();
};

// voices loaded callback (async)
window.speechSynthesis.onvoiceschanged = function ()
{
    voiceMap = getVoiceMap(synth.getVoices());
    voiceMapKeys = Object.keys(voiceMap);
    if (CABLES.UI)
    {
        voicePort.uiAttribs.values = voiceMapKeys; // update dropdown values
        op.refreshParams();// update visible dropdown menu
    }
};

/**
 * Updates the state output ports
 */
function updateState()
{
    speakingPort.set(synth.speaking);
    pendingPort.set(synth.pending);
    pausedPort.set(synth.paused);
    nextPort.trigger();
}

/**
 * says the text from text-port using voice voice
 */
function say()
{
    let text = textPort.get();
    let voice;
    let voiceDisplayName = voicePort.get();
    if (voiceDisplayName && voiceMap.hasOwnProperty(voiceDisplayName))
    { // voices are loaded async, at start it may not be there
        voice = voiceMap[voiceDisplayName];
    }
    let utterance = new SpeechSynthesisUtterance(text);
    if (voice)
    {
        utterance.voice = voice;
    }
    let pitch = pitchPort.get();
    if (pitch < PITCH_MIN) { pitch = PITCH_MIN; }
    else if (pitch > PITCH_MAX) { pitch = PITCH_MAX; }
    utterance.pitch = pitch;
    let rate = ratePort.get();
    if (rate < RATE_MIN) { rate = RATE_MIN; }
    else if (rate > RATE_MAX) { rate = RATE_MAX; }
    utterance.rate = rate;
    let volume = volumePort.get();
    if (volume < VOLUME_MIN) { volume = VOLUME_MIN; }
    else if (volume > VOLUME_MAX) { volume = VOLUME_MAX; }
    utterance.volume = volume;
    synth.speak(utterance);
}

/**
 * Returns a map of voices
 * e.g. { "Alex (de-DE)": { voice object }, ...}
 */
function getVoiceMap(voices)
{
    let ret = {};
    if (!voices || voices.length === 0) { return ret; }

    voices.forEach(function (voice)
    {
        let key = voice.name + " (" + voice.lang + ")";
        ret[key] = voice;
    });
    return ret;
}
