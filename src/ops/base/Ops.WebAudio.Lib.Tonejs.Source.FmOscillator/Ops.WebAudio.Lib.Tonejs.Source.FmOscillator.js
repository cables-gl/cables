op.name="FmOscillator";

// constants
var FREQUENCY_DEFAULT = 440;
var DETUNE_DEFAULT = 0;
var PHASE_DEFAULT = 0;
var PHASE_MIN = 0;
var PHASE_MAX = 180;
var MODULATION_INDEX_DEFAULT = 2;
var MODULATION_TYPE_DEFAULT = "square";
var HARMONICITY_DEFAULT = 1;
var VOLUME_DEFAULT = -6;
var MUTE_DEFAULT = false;
var SYNC_FREQUENCY_DEFAULT = false;
var START_DEFAULT = true;
var START_TIME_DEFAULT = "+0";
var STOP_TIME_DEFAULT = "+0";
var AUTO_START_DEFAULT = true;
var TYPES = [
    "sine",
    "square",
    "sawtooth",
    "triangle"
];
var TYPE_DEFAULT = "sine";

// vars
var node = new Tone.FMOscillator();

// inputs
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
var modulationIndexPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Modulation Index", node.modulationIndex, null, MODULATION_INDEX_DEFAULT);
var harmonicityPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Harmonicity", node.harmonicity, null, HARMONICITY_DEFAULT);
var typePort = op.addInPort( new Port( op, "Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES } ) );
typePort.set(TYPE_DEFAULT);
var modulationTypePort = op.addInPort( new Port( op, "Modulation Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES } ) );
modulationTypePort.set(MODULATION_TYPE_DEFAULT);
var phasePort = op.addInPort( new Port( op, "Phase", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PHASE_MIN, 'max': PHASE_MAX } ));
phasePort.set(PHASE_DEFAULT);
var syncFrequencyPort = op.inValueBool("Sync Frequency", SYNC_FREQUENCY_DEFAULT);
var startPort = op.addInPort( new Port( op, "Start", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var stopPort = op.addInPort( new Port( op, "Stop", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
var autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);
var mutePort = op.addInPort( new Port( op, "Mute", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(MUTE_DEFAULT);

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
typePort.onChange = function() {
    var type = typePort.get();
    if(type && TYPES.indexOf(type) > -1) {
        node.set("type", type);
    }
};
modulationTypePort.onChange = function() {
    var modulationType = modulationTypePort.get();
    if(modulationType && TYPES.indexOf(modulationType) > -1) {
        node.set("modulationType", modulationType);
    }
};
phasePort.onChange = function() {
    var phase = phasePort.get();
    if(phase >= PHASE_MIN && phase <= PHASE_MAX) {
        node.set("phase", phase);    
    }
};
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
autoStartPort.onChange = function() {
    op.log("autoStartPort changed: ", autoStartPort.get());
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

