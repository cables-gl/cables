
CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var TYPES = [
    "sine", 
    "sine2", 
    "sine3", 
    "sine4", 
    "sine5", 
    "sine6", 
    "sine7", 
    "sine8", 
    "square", 
    "square2", 
    "square3", 
    "square4", 
    "square5", 
    "square6", 
    "square7", 
    "square8", 
    "triangle",
    "triangle2",
    "triangle3",
    "triangle4",
    "triangle5",
    "triangle6",
    "triangle7",
    "triangle8",
    "sawtooth",
    "sawtooth2",
    "sawtooth3",
    "sawtooth4",
    "sawtooth5",
    "sawtooth6",
    "sawtooth7",
    "sawtooth8"
];
var NORMAL_RANGE_MIN = 0;
var NORMAL_RANGE_MAX = 1;

var FREQUENCY_DEFAULT = 440;
var TYPE_DEFAULT = "sine";
var DETUNE_DEFAULT = 0;
var PHASE_DEFAULT = 0;
var PHASE_MIN = 0;
var PHASE_MAX = 180;
var VOLUME_DEFAULT = -6;
var VOLUME_MIN = -96;
var VOLUME_MAX = 0;
var SYNC_FREQUENCY_DEFAULT = false;
var START_DEFAULT = true;
var START_TIME_DEFAULT = "+0";
var STOP_TIME_DEFAULT = "+0";
var AUTO_START_DEFAULT = true;

// vars
var node = new Tone.Oscillator(FREQUENCY_DEFAULT, TYPE_DEFAULT);

// input ports
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
var detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
var typePort = op.addInPort( new CABLES.Port( op, "Type", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES } ) );
typePort.set("sine");
var phasePort = op.addInPort( new CABLES.Port( op, "Phase", CABLES.OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': PHASE_MIN, 'max': PHASE_MAX }, PHASE_DEFAULT ));
phasePort.set(PHASE_DEFAULT);
var syncFrequencyPort = op.inValueBool("Sync Frequency", SYNC_FREQUENCY_DEFAULT);
var startPort = op.addInPort( new CABLES.Port( op, "Start",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var stopPort = op.addInPort( new CABLES.Port( op, "Stop",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
var autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, {'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX}, VOLUME_DEFAULT);
//volumePort.set(VOLUME_DEFAULT);

var mutePort = op.addInPort( new CABLES.Port( op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(false);

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

// change listeners
typePort.onChange = function() {setNodeValue("type", typePort.get());};
phasePort.onChange = function() {setNodeValue("phase", phasePort.get());};
mutePort.onChange = function() {setNodeValue("mute", mutePort.get());};


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

function setNodeValue(key, value) {
    try{
        node.set(key, value);    
    } catch(e) {
        op.log("ERROR!", e);
    }
}

// output ports
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