op.name="PulseOscillator";

if(Tone && Tone.context && Tone.context._context && window.audioContext) {
    op.log('Checking audio context before: Tone.context._context === window.audioContext: ' + Tone.context._context === window.audioContext);
}

CABLES.WEBAUDIO.createAudioContext(op);


if(Tone && Tone.context && Tone.context._context && window.audioContext) {
    op.log('Checking audio context after: Tone.context._context === window.audioContext: ' + Tone.context._context === window.audioContext);
}

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
var MUTE_DEFAULT = false;
var SYNC_FREQUENCY_DEFAULT = false;
var START_DEFAULT = true;
var START_TIME_DEFAULT = "+0";
var STOP_TIME_DEFAULT = "+0";
var AUTO_START_DEFAULT = true;

// vars
var node = new Tone.PulseOscillator();

//inputs
var widthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Width", node.width, {'display': 'range', 'min': WIDTH_MIN, 'max': WIDTH_MAX}, WIDTH_DEFAULT);
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
var phasePort = op.addInPort( new Port( op, "Phase", CABLES.OP_PORT_TYPE_, { 'display': 'range', 'min': PHASE_MIN, 'max': PHASE_MAX } ));
phasePort.set(PHASE_DEFAULT);
var syncFrequencyPort = op.inValueBool("Sync Frequency", SYNC_FREQUENCY_DEFAULT);
var startPort = op.addInPort( new Port( op, "Start", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var stopPort = op.addInPort( new Port( op, "Stop", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
var autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);
var mutePort = op.addInPort( new Port( op, "Mute", CABLES.OP_PORT_TYPE_, { display: 'bool' } ) );

// set defaults
node.set("width", WIDTH_DEFAULT);
node.set("frequency", FREQUENCY_DEFAULT);
node.set("detune", DETUNE_DEFAULT);
node.set("phase", PHASE_DEFAULT);
node.set("volume", VOLUME_DEFAULT);
node.set("mute", MUTE_DEFAULT);

function setSyncAndAutostart() {
    var syncFrequency = syncFrequencyPort.get();
    if(syncFrequency) {
        syncFrequency();
    } else {
        unsyncFrequency();
    }
    if(autoStartPort.get()) {
        start();
    }
}

// init
op.onLoaded = setSyncAndAutostart;

// functions
function syncFrequency() {
    node.sync();
}

function unsyncFrequency() {
    node.unsync();
}

function start() {
    if(node.state !== 'started') {
        var startTime = startTimePort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(startTime)) {
            startTime = START_TIME_DEFAULT;
        }
        node.start(startTime);
    }
}

function stop() {
    if(node.state !== 'stopped') {
        var stopTime = stopTimePort.get();
        if(!CABLES.WEBAUDIO.isValidToneTime(stopTime)) {
            stopTime = STOP_TIME_DEFAULT;
        }
        node.stop(stopTime);
    }
}

// change listeners
startPort.onTriggered = function() {
    start();
};

stopPort.onTriggered = function() {
    stop();
};

mutePort.onChange = function() {
    node.mute = mutePort.get() ? true : false; 
};

syncFrequencyPort.onChange = function() {
    var sync = syncFrequencyPort.get();
    if(sync) {
        syncFrequency();
    } else {
        unsyncFrequency();
    }
};

phasePort.onChange = function() {
    var phase = phasePort.get();
    if(phase >= PHASE_MIN && phase <= PHASE_MAX) {
        node.set("phase", phase);
    }
};

//outputs
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
audioOutPort.onLinkChanged = function() {
    //op.log("link changed");
    if(audioOutPort.isLinked()) {
        setSyncAndAutostart();
    }
};

// clean up
op.onDelete = function() {
    node.dispose();
};

