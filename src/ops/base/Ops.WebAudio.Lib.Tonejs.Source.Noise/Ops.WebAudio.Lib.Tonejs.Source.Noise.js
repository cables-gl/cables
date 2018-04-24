op.name="Noise";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
var PLAYBACK_RATE_DEFAULT = 1;
var PLAYBACK_RATE_MIN = 0.01; //?
var PLAYBACK_RATE_MAX = 100; //?
var TYPES = [
    "white",
    "brown",
    "pink"
];
var TYPE_DEFAULT = "white";
var VOLUME_DEFAULT = -6;
var MUTE_DEFAULT = false;
var START_DEFAULT = true;
var START_TIME_DEFAULT = "+0";
var STOP_TIME_DEFAULT = "+0";
var AUTO_START_DEFAULT = true;

// vars
var node = new Tone.Noise(TYPE_DEFAULT);

// inputs
var playbackRatePort = op.inValue("Playback Rate", PLAYBACK_RATE_DEFAULT);
var typePort = op.addInPort( new Port( op, "Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES } ) );
typePort.set(TYPE_DEFAULT);
var startPort = op.addInPort( new Port( op, "Start", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var stopPort = op.addInPort( new Port( op, "Stop", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
var autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);
var mutePort = op.addInPort( new Port( op, "Mute", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(MUTE_DEFAULT);

function checkAutostart() {
    if(autoStartPort.get()) {
        start();
    }
}

// init
op.onLoaded = checkAutostart;

// functions
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
playbackRatePort.onChange = function() {
    var playbackRate = playbackRatePort.get();
    if(playbackRate && playbackRate >= PLAYBACK_RATE_MIN && playbackRate <= PLAYBACK_RATE_MAX) {
        try {
            node.set("playbackRate", playbackRate);
        } catch(e) {
            op.log(e);
        }
    }
};

typePort.onChange = function() {
    var type = typePort.get();
    if(type && TYPES.indexOf(type) > -1) {
        node.type = type;
    }
};

startPort.onTriggered = function() {
    start();
};

stopPort.onTriggered = function() {
    stop();
};

autoStartPort.onChange = function() {
    op.log("autoStartPort changed: ", autoStartPort.get());
};

mutePort.onChange = function() {
    node.mute = mutePort.get() ? true : false; 
};

// outputs
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

audioOutPort.onLinkChanged = function() {
    if(audioOutPort.isLinked()) {
        checkAutostart();
    }
};

// clean up
op.onDelete = function() {
    node.dispose();
};