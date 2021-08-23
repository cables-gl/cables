
// defaults
var FREQUENCY_DEFAULT = 440;
var DETUNE_DEFAULT = 0;
var MODULATION_FREQUENCY_DEFAULT = 0.4;
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
var node = new Tone.PWMOscillator(FREQUENCY_DEFAULT, MODULATION_FREQUENCY_DEFAULT);

// input ports
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
var modulationFrequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Modulation Frequency", node.modulationFrequency, null, MODULATION_FREQUENCY_DEFAULT);
var phasePort = op.addInPort( new CABLES.Port( op, "Phase", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PHASE_MIN, 'max': PHASE_MAX } ));
phasePort.set(PHASE_DEFAULT);
var syncFrequencyPort = op.inValueBool("Sync Frequency", SYNC_FREQUENCY_DEFAULT);
var startPort = op.addInPort( new CABLES.Port( op, "Start",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var stopPort = op.addInPort( new CABLES.Port( op, "Stop",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
var autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);
var mutePort = op.addInPort( new CABLES.Port( op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(MUTE_DEFAULT);

// set defaults
node.set("frequency", FREQUENCY_DEFAULT);
node.set("detune", DETUNE_DEFAULT);
node.set("modulationFrequency", MODULATION_FREQUENCY_DEFAULT);
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

autoStartPort.onChange = function() {
    op.log("autoStartPort changed: ", autoStartPort.get());
};

// functions
function syncFrequency() {
    node.syncFrequency();
}

function unsyncFrequency() {
    node.unsyncFrequency();
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

// outputs
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
